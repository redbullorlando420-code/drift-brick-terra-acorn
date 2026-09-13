import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
try {
  const page = await browser.newPage();
  // Isolated context and empty shell avoid background imports or user data.
  await page.route('http://127.0.0.1:8080/', route => route.fulfill({ contentType: 'text/html', body: '<html></html>' }));
  await page.goto('http://127.0.0.1:8080/');
  const selected = await page.evaluate(async () => {
    const { useLibrary } = await import('/src/lib/videos/store.ts');
    localStorage.setItem('reelcase.prefs.v4', JSON.stringify({ sourceId: 'home', favorites: [], likes: [], follows: [] }));
    const restore = useLibrary.getState().restoreFolders();
    useLibrary.getState().setSource('history');
    await restore;
    return useLibrary.getState().sourceId;
  });
  assert.equal(selected, 'history');
  console.log('PASS: navigation during asynchronous preference restore stays on History');
} finally { await browser.close(); }
