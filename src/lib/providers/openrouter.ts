import { NextRequest } from "next/server";
import { getApiKey, parseOpenAICompatibleStream, type StreamChunk } from "./base";

export async function* streamFromOpenRouter(model: string, prompt: string, req: NextRequest): AsyncGenerator<StreamChunk, void, unknown> {
  const keyResult = getApiKey("openrouter", req);
  if (!keyResult.ok) {
    yield { error: keyResult.error };
    return;
  }

  const body = {
    model,
    stream: true,
    messages: [{ role: "user", content: prompt }],
  };

  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keyResult.value}`,
          "X-Title": "Viber AI",
          "HTTP-Referer": req.nextUrl.origin,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        if (attempt < MAX_RETRIES) {
          const waitMs = Math.pow(2, attempt) * 1000;
          yield { text: `\n⏳ Rate limited by OpenRouter (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${waitMs / 1000}s...\n` };
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        const errText = await res.text().catch(() => "");
        yield { error: `OpenRouter rate limit exceeded after ${MAX_RETRIES} retries: ${errText}` };
        return;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        yield { error: `OpenRouter ${res.status}: ${errText || "request failed"}` };
        return;
      }

      if (!res.body) {
        const text = await res.text().catch(() => "");
        yield { error: `OpenRouter request failed: ${text || res.status}` };
        return;
      }

      yield* parseOpenAICompatibleStream(res, "OpenRouter");
      return; // Success, exit retry loop
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        const waitMs = Math.pow(2, attempt) * 1000;
        yield { text: `\n⚠️ Connection error (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${waitMs / 1000}s...\n` };
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      yield { error: `OpenRouter streaming error after retries: ${error}` };
    }
  }
}