import { createServerFn } from "@tanstack/react-start";

export const askRecommendations = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const value = data as { prompt?: unknown; catalog?: unknown };
    return { prompt: typeof value?.prompt === "string" ? value.prompt.slice(0, 600) : "", catalog: typeof value?.catalog === "string" ? value.catalog.slice(0, 2400) : "" };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI recommendations are not enabled for this library yet." };
    const response = await fetch("https://api.x.ai/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "grok-4.5", max_tokens: 260, messages: [{ role: "system", content: "You are Reelcase's concise media recommendation guide. Use only the supplied local catalog. Suggest 3 titles max, explain why, and never claim to have watched a video." }, { role: "user", content: `Catalog:\n${data.catalog}\n\nRequest: ${data.prompt}` }] }) });
    if (!response.ok) return { ok: false as const, error: "Recommendation service is unavailable." };
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { ok: true as const, text: body.choices?.[0]?.message?.content ?? "No recommendation returned." };
  });
