import type { AstroIntegration } from "astro";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleChat } from "./chat.js";

const HOP_BY_HOP = new Set(["host", "connection", "content-length", "transfer-encoding", "keep-alive", "upgrade"]);

async function forward(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);

    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (HOP_BY_HOP.has(name) || value === undefined) continue;
      headers.set(name, Array.isArray(value) ? value.join(", ") : value);
    }

    const method = req.method ?? "GET";
    const request = new Request(`http://${req.headers.host ?? "localhost"}/api/chat`, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : Buffer.concat(chunks),
    });

    const response = await handleChat(request, process.env);
    res.statusCode = response.status;
    response.headers.forEach((value, name) => res.setHeader(name, value));

    if (!response.body) {
      res.end();
      return;
    }
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error("[dev-chat-api]", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
    }
    res.end(JSON.stringify({ error: "internal_error" }));
  }
}

export function devChatApi(): AstroIntegration {
  return {
    name: "dev-chat-api",
    hooks: {
      "astro:server:setup": ({ server, logger }) => {
        try {
          process.loadEnvFile(".env");
        } catch {
          logger.warn("No .env file found: the assistant will report that it is not configured.");
        }
        server.middlewares.use("/api/chat", (req, res) => {
          void forward(req, res);
        });
      },
    },
  };
}
