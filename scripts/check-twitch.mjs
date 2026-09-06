import { readFileSync } from 'node:fs';
const src = readFileSync('src/lib/remote/api.ts', 'utf8');
const query = src.slice(src.indexOf('async function twitchUser')).match(/query: `([^`]+)`/)[1];
const response = await fetch('https://gql.twitch.tv/gql', { method: 'POST', headers: { 'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko', 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables: { login: 'ironmouse' } }), signal: AbortSignal.timeout(10000) });
const result = await response.json();
console.log(JSON.stringify({ status: response.status, errors: result.errors, user: result.data?.user?.displayName, videos: result.data?.user?.videos?.edges?.length }));
