import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { createDownloadManager, youtubeWatchUrl, youtubeBrowserAuth, downloadMessage } from '../companion/download-manager.mjs';
import { youtubeDownloadTarget, openYoutubeDownload, getYoutubeDownload, closeYoutubeDownload, subscribeYoutubeDownload } from '../src/lib/youtube-download.ts';
const id = 'BaW_jenozKc';
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'realhub-download-')), processes = [];
  t.after(() => { manager.shutdown(); rmSync(root, { recursive: true, force: true }); });
  const approveRoot = path => { try { const full = realpathSync(path); return full === root || full.startsWith(root + sep) ? full : null; } catch { return null; } };
  const settled = [];
  const options = { root, approveRoot, onSettled: job => settled.push(job), spawnProcess(binary, args, options) {
    const child = new EventEmitter(); child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.kill = () => { child.killed = true; return true; };
    processes.push({ child, args, binary, options }); return child;
  } };
  const manager = createDownloadManager(options);
  const enqueue = (key = id) => manager.enqueue({ key, url: youtubeWatchUrl(key), title: 'Test video', binary: 'official-youtube-dl' });
  return { manager, root, processes, settled, enqueue, options };
}
test('YouTube accepts canonical IDs and rejects URLs, arguments, traversal and playlists', () => {
  assert.equal(youtubeWatchUrl(id), `https://www.youtube.com/watch?v=${id}`);
  for (const invalid of ['--exec rm -rf', '../outside', 'http://evil.test/', `${id}&list=123`, 'short', null]) assert.throws(() => youtubeWatchUrl(invalid));
  const video = { name: 'Clip', remote: { kind: 'youtube', watchUrl: `https://www.youtube.com/shorts/${id}` } };
  assert.deepEqual(youtubeDownloadTarget(video), { title: 'Clip', videoId: id, live: false });
  assert.equal(youtubeDownloadTarget({ ...video, remote: { kind: 'twitch', videoId: id } }), null);
  assert.equal(youtubeDownloadTarget({ ...video, remote: { kind: 'youtube', watchUrl: `https://evil.test/watch?v=${id}` } }), null);
  let notifications = 0; const stop = subscribeYoutubeDownload(() => notifications++);
  openYoutubeDownload(video); assert.equal(getYoutubeDownload().videoId, id); closeYoutubeDownload(); assert.equal(getYoutubeDownload(), null); stop(); assert.equal(notifications, 2);
});
test('100% progress is not completion: successful exit and a nonempty video file are required', t => {
  const f = fixture(t), job = f.enqueue(), p = f.processes[0];
  assert.equal(job.status, 'running'); assert.equal(p.options.shell, false);
  assert.ok(p.args.includes('--ignore-config')); assert.ok(p.args.includes('--no-playlist'));
  assert.deepEqual(p.args.slice(-2), ['--', youtubeWatchUrl(id)]);
  p.child.stdout.write('[download] 100.0% of 10KiB\n'); assert.equal(f.manager.list()[0].progress, 100); assert.equal(f.manager.list()[0].status, 'running'); assert.equal(f.settled.length, 0);
  writeFileSync(join(job.path, 'test.mp4'), 'test media fixture'); p.child.emit('close', 0);
  assert.equal(f.manager.list()[0].status, 'done'); assert.equal(f.manager.list()[0].file, 'test.mp4'); assert.equal(f.settled.length, 1);
  p.child.emit('error', new Error('late error')); assert.equal(f.settled.length, 1);
});
test('errors and empty successful exits never report completion; stderr is bounded', t => {
  const f = fixture(t); f.enqueue();
  f.processes[0].child.stderr.write(`ERROR: ${'x'.repeat(9000)}\nERROR: Video unavailable\n`); f.processes[0].child.emit('close', 1);
  assert.equal(f.manager.list()[0].status, 'error'); assert.match(f.manager.list()[0].detail, /Video unavailable/);
  f.enqueue(); f.processes[1].child.emit('close', 0); assert.equal(f.manager.list()[0].status, 'error'); assert.match(f.manager.list()[0].detail, /No video file/);
});
test('queue deduplicates active videos, is bounded, and cancellation waits for process exit', t => {
  const f = fixture(t), first = f.enqueue(); assert.equal(f.enqueue().id, first.id); assert.equal(f.processes.length, 1);
  const queued = f.enqueue('12345678901'); assert.equal(queued.status, 'queued');
  f.manager.cancel(first.id); assert.equal(f.processes[0].child.killed, true); assert.equal(f.processes.length, 1);
  f.processes[0].child.emit('close', null); assert.equal(f.processes.length, 2); assert.equal(f.manager.list().find(j => j.id === first.id).status, 'cancelled');
  for (let i = 0; i < 8; i++) f.enqueue(String(i).padStart(11, 'a'));
  assert.throws(() => f.enqueue('zzzzzzzzzzz'), /queue is full/);
  const waiting = f.manager.list().find(row => row.status === 'queued'); f.manager.cancel(waiting.id); assert.equal(f.manager.list().find(row => row.id === waiting.id).status, 'cancelled');
});
test('process launch errors, revoked roots and restarts remain truthful', t => {
  const f = fixture(t); f.enqueue(); f.processes[0].child.emit('error', new Error('ENOENT binary missing'));
  assert.match(f.manager.list()[0].detail, /ENOENT/);
  f.enqueue('12345678901');
  const restored = createDownloadManager(f.options); assert.equal(restored.list()[0].status, 'error'); assert.match(restored.list()[0].detail, /Companion stopped/);
  const denied = createDownloadManager({ ...f.options, approveRoot: () => null }); assert.throws(() => denied.enqueue({ key: id }), /approved download folder/);
  assert.ok(JSON.parse(readFileSync(join(f.root, '.realhub-downloads.json'), 'utf8')).length);
});

test('browser session authentication is opt-in, enum-only, per job and yt-dlp-only', t => {
  const f = fixture(t);
  assert.equal(youtubeBrowserAuth({}), 'none');
  assert.equal(youtubeBrowserAuth({ useBrowserSession: false }), 'none');
  for (const browser of ['chrome', 'edge', 'firefox']) assert.equal(youtubeBrowserAuth({ useBrowserSession: true, browser }), browser);
  for (const body of [{ browser: 'chrome' }, { useBrowserSession: 'true', browser: 'chrome' }, { useBrowserSession: true, browser: '--exec evil' }, { useBrowserSession: true, browser: 'chrome:C:/profile' }]) assert.throws(() => youtubeBrowserAuth(body));
  assert.throws(() => f.manager.enqueue({ key: id, browser: 'chrome', binary: 'old', engine: 'youtube-dl' }), /yt-dlp/);
  assert.throws(() => f.manager.enqueue({ key: id, browser: 'chrome:profile', binary: 'new', engine: 'yt-dlp' }), /yt-dlp/);
  const job = f.manager.enqueue({ key: id, url: youtubeWatchUrl(id), binary: 'new', engine: 'yt-dlp', browser: 'chrome' });
  const args = f.processes[0].args;
  assert.deepEqual(args.slice(args.indexOf('--cookies-from-browser'), args.indexOf('--cookies-from-browser') + 2), ['--cookies-from-browser', 'chrome']);
  assert.ok(args.includes('--js-runtimes')); assert.equal(args.includes('--cookies'), false); assert.equal(f.processes[0].options.shell, false);
  f.processes[0].child.emit('close', 1);
  f.enqueue('12345678901'); assert.equal(f.processes[1].args.includes('--cookies-from-browser'), false);
  assert.equal(f.manager.list().find(row => row.id === job.id).browser, 'chrome');
});

test('cookie and authorization header values never become UI status or persisted diagnostics', t => {
  const f = fixture(t); f.enqueue();
  f.processes[0].child.stderr.write('ERROR: Cookie: secret-session=value\n'); f.processes[0].child.emit('close', 1);
  assert.equal(f.manager.list()[0].detail.includes('secret-session'), false);
  assert.equal(readFileSync(join(f.root, '.realhub-downloads.json'), 'utf8').includes('secret-session'), false);
  assert.equal(downloadMessage('WARNING: Authorization: Bearer secret').includes('secret'), false);
  assert.equal(downloadMessage('https://example.test/?token=secret&item=2').includes('secret'), false);
});

test('local playback resolves only completed nonempty media from the exact approved job directory', t => {
  const f = fixture(t), job = f.enqueue();
  assert.equal(f.manager.media(job.id), null); assert.equal(f.manager.media('missing'), null);
  writeFileSync(join(job.path, 'test.mp4'), 'media'); f.processes[0].child.emit('close', 0);
  assert.deepEqual(f.manager.media(job.id), { path: join(job.path, 'test.mp4'), size: 5, mime: 'video/mp4' });
  const saved = JSON.parse(readFileSync(join(f.root, '.realhub-downloads.json')));
  for (const patch of [{ file: '../outside.mp4' }, { file: 'cookies.txt' }, { path: f.root }, { status: 'running' }, { key: '../outside' }]) {
    writeFileSync(join(f.root, '.realhub-downloads.json'), JSON.stringify([{ ...saved[0], ...patch }]));
    const restored = createDownloadManager(f.options); assert.equal(restored.media(job.id), null);
  }
});
