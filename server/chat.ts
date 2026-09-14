import { systemPrompt } from "./knowledge.js";

type Env = Record<string, string | undefined>;
type ChatMessage = { role: "user" | "assistant"; content: string };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const FALLBACK_MODEL = "openai/gpt-oss-120b";
const MAX_BODY_BYTES = 24_000;
const MAX_MESSAGES = 12;
const MAX_USER_CHARS = 800;
const MAX_ASSISTANT_CHARS = 2_400;
const MAX_TOTAL_CHARS = 9_000;
const PER_MINUTE = 8;
const PER_HOUR = 60;
const HOUR_MS = 3_600_000;
const UPSTREAM_TIMEOUT_MS = 25_000;

const requestLog = new Map<string, number[]>();

function json(status: number, body: Record<string, unknown>, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

function clientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip") ?? forwarded ?? "anonymous";
}

function isRateLimited(id: string, now: number): boolean {
  const recent = (requestLog.get(id) ?? []).filter((time) => now - time < HOUR_MS);
  const lastMinute = recent.filter((time) => now - time < 60_000).length;
  if (lastMinute >= PER_MINUTE || recent.length >= PER_HOUR) {
    requestLog.set(id, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(id, recent);

  if (requestLog.size > 5_000) {
    for (const [key, times] of requestLog) {
      if (!times.some((time) => now - time < HOUR_MS)) requestLog.delete(key);
    }
  }
  return false;
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function parseMessages(payload: unknown): ChatMessage[] | null {
  if (!payload || typeof payload !== "object") return null;
  const list = (payload as { messages?: unknown }).messages;
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_MESSAGES) return null;

  const messages: ChatMessage[] = [];
  let total = 0;
  for (const item of list) {
    if (!item || typeof item !== "object") return null;
    const { role, content } = item as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    const limit = role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    if (!text || text.length > limit) return null;
    total += text.length;
    messages.push({ role, content: text });
  }

  if (total > MAX_TOTAL_CHARS || messages[messages.length - 1]!.role !== "user") return null;
  return messages;
}

function parseKeys(env: Env): string[] {
  return (env.GROQ_API_KEYS ?? env.GROQ_API_KEY ?? "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function streamContent(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let emitted = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") {
            controller.close();
            await reader.cancel();
            return;
          }
          try {
            const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              controller.enqueue(encoder.encode(delta));
              emitted = true;
            }
          } catch {
            continue;
          }
        }
        if (emitted) return;
      }
    },
    cancel() {
      return reader.cancel();
    },
  });
}

export async function handleChat(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json(405, { error: "method_not_allowed" }, { Allow: "POST" });
  }
  if (!isSameOrigin(request)) {
    return json(403, { error: "forbidden" });
  }

  const keys = parseKeys(env);
  if (keys.length === 0) {
    return json(503, { error: "not_configured" });
  }

  if (isRateLimited(clientId(request), Date.now())) {
    return json(429, { error: "rate_limited" }, { "Retry-After": "60" });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json(413, { error: "too_large" });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const messages = parseMessages(payload);
  if (!messages) {
    return json(400, { error: "invalid_messages" });
  }

  const models = [...new Set([env.GROQ_MODEL?.trim() || DEFAULT_MODEL, FALLBACK_MODEL])];
  const start = Math.floor(Math.random() * keys.length);

  for (const model of models) {
    const body = JSON.stringify({
      model,
      stream: true,
      temperature: 0.2,
      max_completion_tokens: 700,
      reasoning_effort: "low",
      include_reasoning: false,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    for (let attempt = 0; attempt < keys.length; attempt++) {
      const key = keys[(start + attempt) % keys.length]!;
      let upstream: Response;
      try {
        upstream = await fetch(GROQ_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body,
          signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        });
      } catch {
        continue;
      }

      if (upstream.ok && upstream.body) {
        return new Response(streamContent(upstream.body), {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      const retryable = upstream.status === 429 || upstream.status === 401 || upstream.status === 403 || upstream.status >= 500;
      if (!retryable) {
        console.error(`Groq request failed with status ${upstream.status}: ${(await upstream.text()).slice(0, 300)}`);
        return json(502, { error: "upstream_error" });
      }
    }
  }

  return json(503, { error: "upstream_unavailable" }, { "Retry-After": "30" });
}
