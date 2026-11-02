let current={revision:0,ids:new Set<string>()};
/** Hidden folders still define privacy for retained history and saved marks. */
export function hiddenSourcePrivacy(){return current;}
export function setHiddenPrivateSources(ids:Iterable<string>){const next=new Set(ids);if(next.size===current.ids.size&&[...next].every(id=>current.ids.has(id)))return;current={revision:current.revision+1,ids:next};}
