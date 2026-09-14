import { handleChat } from "../../server/chat.js";

interface PagesContext {
  request: Request;
  env: Record<string, string | undefined>;
}

export const onRequest = (context: PagesContext) => handleChat(context.request, context.env);
