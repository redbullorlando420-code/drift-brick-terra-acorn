import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
// Read-only comparison: provider tests never import the changed UI. Remove the
// only provider dependency change (Accounts in SYSTEM_SOURCES) in memory.
registerHooks({load(url,context,next){if(url.endsWith('/src/lib/videos/types.ts'))return {format:'module-typescript',source:readFileSync(new URL(url),'utf8').replaceAll('  | "accounts"\n','').replaceAll('  "accounts",\n','').replaceAll('  | "accounts"\r\n','').replaceAll('  "accounts",\r\n',''),shortCircuit:true};return next(url,context);}});
await import('../scripts/pull-entry-limits.test.mjs');
