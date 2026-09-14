import { handleChat } from "../server/chat.js";

export default {
  fetch(request: Request) {
    return handleChat(request, process.env);
  },
};
