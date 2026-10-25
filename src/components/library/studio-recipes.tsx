import { useEffect, useRef, useState } from 'react';
import { BookmarkPlus, Download, Upload, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { createLocalId } from '@/lib/local-id';
import { MAX_RECIPE_BYTES, MAX_STUDIO_RECIPES, parseRecipe, recipeDocument, restoreRecipes, type RecipeContent, type StudioRecipe } from '@/lib/studio-recipes';
import type { StudioSettings } from '@/lib/studio-settings';

export function StudioRecipes({ owner, result, disabled, onReuse }: { owner: string; result?: RecipeContent; disabled: boolean; onReuse: (settings: StudioSettings) => void }) {
  const key = `reelcase.studio.recipes.v1:${encodeURIComponent(owner)}`;
  const read = () => restoreRecipes(localStorage.getItem(key));
  const [recipes, setRecipes] = useState<StudioRecipe[]>(() => { try { return read(); } catch { return []; } });
  const [name, setName] = useState(''), [note, setNote] = useState(''), [error, setError] = useState(''), [importing, setImporting] = useState(false), [removed, setRemoved] = useState<StudioRecipe | null>(null);
  const [editing, setEditing] = useState<string | null>(null), [newName, setNewName] = useState('');
  const input = useRef<HTMLInputElement>(null), mounted = useRef(true);
  useEffect(() => { mounted.current = true; const update = (event: StorageEvent) => { if (event.key === key) setRecipes(restoreRecipes(event.newValue)); }; window.addEventListener('storage', update); return () => { mounted.current = false; window.removeEventListener('storage', update); }; }, [key]);
  const commit = (rows: StudioRecipe[]) => { localStorage.setItem(key, JSON.stringify(rows)); setRecipes(rows); };
  const save = (content: RecipeContent) => {
    const latest = read();
    if (latest.some(row => JSON.stringify(row.settings) === JSON.stringify(content.settings) && row.checkpoint === content.checkpoint)) { setNote('This recipe is already saved.'); return; }
    if (latest.length >= MAX_STUDIO_RECIPES) throw new Error('Your eight recipe slots are full. Export or remove a recipe before saving another.');
    commit([{ ...content, id: createLocalId('recipe:'), savedAt: Date.now() }, ...latest]);
    setName(''); setRemoved(null); setNote('Recipe saved in this browser account. No image or credentials were stored.');
  };
  const exportRecipe = (recipe: StudioRecipe) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(recipeDocument(recipe), null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'realhub-image-recipe.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importRecipe = async (file?: File) => {
    if (!file) return;
    setError(''); setNote(''); setImporting(true);
    try { if (file.size > MAX_RECIPE_BYTES) throw new Error('Choose a recipe JSON file smaller than 64 KB.'); const content = parseRecipe(await file.text()); if (mounted.current) save(content); }
    catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : 'Recipe could not be imported. Browser storage may be full.'); }
    finally { if (mounted.current) { setImporting(false); if (input.current) input.current.value = ''; } }
  };
  const run = (action: () => void) => { setError(''); setNote(''); try { action(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Recipes could not be saved.'); } };
  const rename = (id: string) => run(() => {
    const title = newName.trim();
    if (!title) throw new Error('Enter a name for this recipe.');
    const latest = read();
    if (!latest.some(row => row.id === id)) throw new Error('This recipe was removed in another tab.');
    commit(latest.map(row => row.id === id ? { ...row, name: title.slice(0, 80) } : row));
    setEditing(null); setNote('Recipe renamed. Its image settings are unchanged.');
  });
  return <Card className="mt-5"><CardHeader><CardTitle>Saved image recipes</CardTitle><CardDescription>Keep up to eight sets of prompts and settings in this browser account. Export a recipe to keep it elsewhere; importing never starts generation or changes the engine’s checkpoint.</CardDescription></CardHeader><CardContent>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="min-w-0 flex-1 space-y-2 text-sm">Recipe name<Input aria-label="Recipe name" maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="Optional name for your latest image" /></label><Button disabled={disabled || !result || importing} onClick={() => run(() => { if (result) save({ ...result, name: name.trim() || result.name }); })}><BookmarkPlus className="size-4" />Save image recipe</Button></div>
    <p className="text-xs text-muted">{recipes.length} of {MAX_STUDIO_RECIPES} slots used. A recipe stores settings, not the image itself.</p>
    {recipes.length ? <ul className="divide-y divide-border">{recipes.map(recipe => <li key={recipe.id} className="space-y-3 py-4"><div><h3 className="break-words font-medium">{recipe.name}</h3><p className="mt-1 text-xs leading-5 text-muted">{recipe.settings.size} × {recipe.settings.size} · {recipe.settings.steps} steps · seed {recipe.settings.seed === -1 ? 'random' : recipe.settings.seed}</p>{recipe.checkpoint && <p className="mt-1 break-words text-xs leading-5 text-muted">Checkpoint: {recipe.checkpoint}</p>}</div>{editing === recipe.id && <div className="space-y-3 rounded-lg border border-border bg-bg p-3"><label className="block space-y-2 text-sm">New recipe name<Input aria-label="New recipe name" maxLength={80} value={newName} autoFocus onChange={event => setNewName(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); rename(recipe.id); } if (event.key === "Escape") setEditing(null); }} /></label><div className="flex flex-wrap gap-2"><Button onClick={() => rename(recipe.id)}>Save recipe name</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel rename</Button></div></div>}<div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={disabled} aria-label={`Use recipe ${recipe.name}`} onClick={() => { onReuse({ ...recipe.settings }); setNote('Recipe loaded into the form. Check the engine and use the same checkpoint before generating.'); }}>Use recipe</Button><Button variant="ghost" aria-label={`Export recipe ${recipe.name}`} onClick={() => exportRecipe(recipe)}><Download className="size-4" />Export JSON</Button><Button variant="ghost" aria-label={`Rename recipe ${recipe.name}`} onClick={() => { setEditing(recipe.id); setNewName(recipe.name); setError(""); }}>Rename</Button><Button variant="ghost" aria-label={`Remove recipe ${recipe.name}`} onClick={() => run(() => { commit(read().filter(row => row.id !== recipe.id)); setRemoved(recipe); setNote('Recipe removed. You can undo this removal.'); })}>Remove</Button></div></li>)}</ul> : <p className="py-3 text-sm leading-6 text-muted">Generate an image and save its recipe to reuse its prompt, settings and actual seed later.</p>}
  </CardContent><CardFooter><input ref={input} className="sr-only" aria-label="Import image recipe file" type="file" disabled={disabled || importing} accept=".json,application/json" onChange={event => void importRecipe(event.target.files?.[0])} /><Button variant="secondary" disabled={importing || disabled} onClick={() => input.current?.click()}><Upload className="size-4" />{importing ? 'Importing…' : 'Import recipe JSON'}</Button>{removed && <Button variant="ghost" onClick={() => run(() => { const latest = read(); if (latest.length >= MAX_STUDIO_RECIPES) throw new Error('Remove another recipe to free a slot for undo.'); if (!latest.some(row => row.id === removed.id)) commit([removed, ...latest]); setRemoved(null); setNote('Recipe restored.'); })}><Undo2 className="size-4" />Undo removal</Button>}</CardFooter>{note && <p role="status" className="px-5 text-sm leading-6 text-muted">{note}</p>}{error && <p role="alert" className="px-5 text-sm leading-6 text-danger">{error}</p>}</Card>;
}
