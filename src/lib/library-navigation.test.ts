import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_SOURCES, navigationSourceLabel, searchResultSource } from './library-navigation.ts';

test('explicit searches from tools navigate to a desk that can render results', () => {
  for (const source of HUB_SOURCES) assert.equal(searchResultSource(source), 'home', source);
});
test('navigation shells and headers identify tools, providers and saved folders consistently', () => {
  const folders = [{ id: 'my-local-folder', name: 'Travel films' }];
  assert.equal(navigationSourceLabel('my-local-folder', folders), 'Travel films');
  assert.equal(navigationSourceLabel('youtube', folders), 'YouTube');
  assert.equal(navigationSourceLabel('settings', folders), 'Settings');
  assert.equal(navigationSourceLabel('mission-plan', folders), 'Milestones');
  assert.equal(navigationSourceLabel('adults', folders), 'Adults');
  for (const source of HUB_SOURCES) assert.notEqual(navigationSourceLabel(source, folders), 'Library', source);
});

test('provider, folder, and private searches preserve their existing scope', () => {
  for (const source of ['home', 'landing', 'youtube', 'twitch', 'movies', 'live', 'history', 'favorites', 'my-local-folder', 'adults', 'adult-fetishes']) {
    assert.equal(searchResultSource(source), source);
  }
});
