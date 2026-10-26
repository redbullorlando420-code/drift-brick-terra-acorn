/** Shared scope rules for application shortcuts. Native controls own their keys. */
export function shortcutBlocked(event: { defaultPrevented?: boolean; isComposing?: boolean; repeat?: boolean; target: EventTarget | null }, options: { editing?: boolean; dialogs?: boolean; allowViewer?:boolean } = {}) {
  if (event.defaultPrevented || event.isComposing || event.repeat) return true;
  if (typeof document !== 'undefined' && options.dialogs !== false && document.querySelector(options.allowViewer ? '[role="dialog"]:not([data-media-viewer]),[role="alertdialog"],[data-shortcut-scope="modal"]' : '[role="dialog"],[role="alertdialog"],[data-shortcut-scope="modal"]')) return true;
  return options.editing !== false && typeof Element !== 'undefined' && event.target instanceof Element && Boolean(event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],iframe,video,audio'));
}
export type CommandContext = { viewer: boolean; provider: boolean; preview: boolean };
export const KEYBOARD_COMMANDS = [
  { id: 'help', label: 'Open keyboard help', keys: '?', scope: 'Application', detail: 'Outside text fields and dialogs. Also available from the header and player.', when: 'always' },
  { id: 'search', label: 'Find in library', keys: 'Ctrl/⌘ + K / /', scope: 'Library', detail: 'Opens the existing search editor.', when: 'browse' },
  { id: 'sidebar', label: 'Toggle navigation', keys: 'Ctrl/⌘ + B', scope: 'Library', detail: 'Expands the desktop sidebar or opens the mobile menu.', when: 'browse' },
  { id: 'grid', label: 'Move between catalog titles', keys: 'Arrows · Home · End', scope: 'Media cards', detail: 'Focus a card first. Home/End stay within the loaded page. Shelves use Left/Right; grids also use Up/Down. Enter opens the focused title.', when: 'browse' },
  { id: 'play', label: 'Play or pause', keys: 'Space / K', scope: 'Local player', detail: 'Outside focused controls. Provider embeds handle their own keys.', when: 'local' },
  { id: 'seek', label: 'Seek 10 seconds', keys: 'Left / Right', scope: 'Local player', detail: 'Hold Shift to seek 30 seconds.', when: 'local' },
  { id: 'volume', label: 'Adjust volume', keys: 'Up / Down', scope: 'Local player', detail: 'Changes volume by 5%. M toggles mute.', when: 'local' },
  { id: 'fullscreen', label: 'Toggle fullscreen', keys: 'F', scope: 'Local player', detail: 'Browser fullscreen permission still applies.', when: 'local' },
  { id: 'next', label: 'Next or previous title', keys: 'N / P', scope: 'Player', detail: 'Outside focused controls. Keys inside a provider iframe remain with that provider.', when: 'player' },
  { id: 'random', label: 'Play another random title', keys: 'R', scope: 'Local player', detail: 'Uses the current playlist.', when: 'local' },
  { id: 'dialog', label: 'Navigate or close a dialog', keys: 'Tab · Shift+Tab · Escape', scope: 'Dialogs', detail: 'Tab stays in the open dialog. Escape closes the top dialog and restores focus. Nested dialogs close first.', when: 'always' },
] as const;
export type ShortcutPreferences = { search: boolean; sidebar: boolean };
let preferences: ShortcutPreferences = { search: true, sidebar: true };
export function readShortcutPreferences(raw: string | null): ShortcutPreferences {
  try { const value = JSON.parse(raw ?? 'null'); return { search: value?.search !== false, sidebar: value?.sidebar !== false }; }
  catch { return { search: true, sidebar: true }; }
}
export function setShortcutPreferences(value: ShortcutPreferences) { preferences = { search: value.search, sidebar: value.sidebar }; }
export function shortcutEnabled(id: keyof ShortcutPreferences) { return preferences[id]; }
export function commandAvailability(when: typeof KEYBOARD_COMMANDS[number]['when'], context: CommandContext) {
  if (when === 'always') return 'Available';
  if (when === 'browse') return context.viewer || context.preview ? 'Close the viewer or preview first' : 'Available in the library';
  if (!context.viewer) return 'Open a video first';
  if (when === 'local' && context.provider) return 'Provider controls own these keys';
  return 'Available outside focused controls';
}
export function filterCommands(query: string) {
  const terms = query.toLowerCase().trim().slice(0, 120).split(/\s+/).filter(Boolean);
  return KEYBOARD_COMMANDS.filter(row => terms.every(term => `${row.label} ${row.keys} ${row.scope} ${row.detail}`.toLowerCase().includes(term)));
}
