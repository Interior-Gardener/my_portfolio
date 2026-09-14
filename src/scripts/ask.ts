import { toast } from "./toast";

type Message = { role: "user" | "assistant"; content: string };

const MAX_INPUT = 800;
const MAX_ASSISTANT = 2_400;
const ALLOWED_HOSTS = [
  "github.com",
  "www.linkedin.com",
  "linkedin.com",
  "leetcode.com",
  "geoswipe.pages.dev",
  "kushal-s0.itch.io",
  "buymeacoffee.com",
  "drive.google.com",
];
const TOKEN =
  /(\[[^\]\n]+\]\([^)\s]+\)|\*\*[^*\n]+\*\*|https?:\/\/[^\s)<>]+|\/work\/[a-z0-9-]+|\/resume\b|[\w.+-]+@[\w-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)/gi;

class ChatError extends Error {}

const dialog = document.querySelector<HTMLDialogElement>("[data-ask]");
if (dialog) setupAsk(dialog);

function setupAsk(dialog: HTMLDialogElement) {
  const log = dialog.querySelector<HTMLElement>("[data-ask-log]")!;
  const intro = dialog.querySelector<HTMLElement>("[data-ask-intro]")!;
  const form = dialog.querySelector<HTMLFormElement>("[data-ask-form]")!;
  const input = dialog.querySelector<HTMLTextAreaElement>("[data-ask-input]")!;
  const send = dialog.querySelector<HTMLButtonElement>("[data-ask-send]")!;
  const stop = dialog.querySelector<HTMLButtonElement>("[data-ask-stop]")!;
  const counter = dialog.querySelector<HTMLElement>("[data-ask-count]")!;
  const reset = dialog.querySelector<HTMLButtonElement>("[data-ask-reset]")!;
  const routes = new Set((dialog.dataset.routes ?? "").split(" ").filter(Boolean));
  const email = dialog.dataset.email ?? "";

  const history: Message[] = [];
  let controller: AbortController | null = null;

  const resize = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  };
  const updateCount = () => {
    const length = input.value.length;
    counter.textContent = `${length}/${MAX_INPUT}`;
    counter.classList.toggle("is-over", length > MAX_INPUT);
    send.disabled = controller !== null || input.value.trim().length === 0 || length > MAX_INPUT;
  };
  const scrollToEnd = () => {
    log.scrollTop = log.scrollHeight;
  };
  const setBusy = (busy: boolean) => {
    stop.hidden = !busy;
    send.hidden = busy;
    dialog.classList.toggle("is-busy", busy);
    updateCount();
  };

  const safeLink = (href: string): HTMLAnchorElement | null => {
    if (href.startsWith("/")) {
      const path = href.replace(/\/$/, "") || "/";
      if (!routes.has(path)) return null;
      const anchor = document.createElement("a");
      anchor.href = path;
      return anchor;
    }
    try {
      const url = new URL(href);
      if (url.protocol !== "https:" || !ALLOWED_HOSTS.includes(url.hostname)) return null;
      const anchor = document.createElement("a");
      anchor.href = url.href;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      return anchor;
    } catch {
      return null;
    }
  };

  const appendInline = (parent: HTMLElement, text: string) => {
    let last = 0;
    for (const match of text.matchAll(TOKEN)) {
      let token = match[0];
      const index = match.index ?? 0;
      if (index > last) parent.append(text.slice(last, index));
      let trailing = "";

      if (token.startsWith("**")) {
        const strong = document.createElement("strong");
        strong.textContent = token.slice(2, -2);
        parent.append(strong);
      } else if (token.startsWith("[")) {
        const [, label = "", href = ""] = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/) ?? [];
        const anchor = safeLink(href);
        if (anchor) {
          anchor.textContent = label;
          parent.append(anchor);
        } else {
          parent.append(label);
        }
      } else if (token.includes("@") && !token.startsWith("http")) {
        const anchor = document.createElement("a");
        anchor.href = `mailto:${token}`;
        anchor.textContent = token;
        parent.append(anchor);
      } else {
        const punctuation = token.match(/[.,;:!?]+$/);
        if (punctuation) {
          trailing = punctuation[0];
          token = token.slice(0, -trailing.length);
        }
        const anchor = safeLink(token);
        if (anchor) {
          anchor.textContent = token;
          parent.append(anchor);
        } else {
          parent.append(token);
        }
      }

      if (trailing) parent.append(trailing);
      last = index + match[0].length;
    }
    if (last < text.length) parent.append(text.slice(last));
  };

  const renderRich = (element: HTMLElement, text: string) => {
    element.replaceChildren();
    const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
    for (const block of blocks) {
      const lines = block
        .split("\n")
        .map((line) => line.replace(/^#{1,6}\s+/, "").trimEnd())
        .filter((line) => line.trim().length > 0);
      if (lines.length === 0) continue;

      const bulleted = lines.every((line) => /^\s*([-*•]|\d+[.)])\s+/.test(line));
      if (bulleted) {
        const list = document.createElement(/^\s*\d/.test(lines[0]!) ? "ol" : "ul");
        for (const line of lines) {
          const item = document.createElement("li");
          appendInline(item, line.replace(/^\s*([-*•]|\d+[.)])\s+/, ""));
          list.append(item);
        }
        element.append(list);
      } else {
        const paragraph = document.createElement("p");
        lines.forEach((line, index) => {
          if (index > 0) paragraph.append(document.createElement("br"));
          appendInline(paragraph, line);
        });
        element.append(paragraph);
      }
    }
  };

  const appendMessage = (role: Message["role"], text: string) => {
    const bubble = document.createElement("div");
    bubble.className = `msg msg--${role === "user" ? "user" : "bot"}`;
    if (role === "user") bubble.textContent = text;
    else renderRich(bubble, text);
    log.append(bubble);
    scrollToEnd();
    return bubble;
  };

  const describeError = async (response: Response): Promise<string> => {
    let code = "";
    try {
      code = ((await response.json()) as { error?: string }).error ?? "";
    } catch {
      code = "";
    }
    if (response.status === 429) return "Lots of questions right now. Please try again in a minute.";
    if (response.status === 404) return "The assistant isn't available on this preview build. It works on the deployed site.";
    if (code === "not_configured") return `The assistant hasn't been configured yet. You can email Kartik at ${email}.`;
    if (response.status === 400 || response.status === 413) return "That message couldn't be sent. Try a shorter question.";
    return `The assistant is having trouble right now. Please try again, or email Kartik at ${email}.`;
  };

  const submit = async () => {
    const text = input.value.trim();
    if (!text || controller) return;
    if (text.length > MAX_INPUT) {
      toast(`Questions can be up to ${MAX_INPUT} characters.`);
      return;
    }

    intro.hidden = true;
    reset.hidden = false;
    input.value = "";
    resize();

    history.push({ role: "user", content: text });
    appendMessage("user", text);
    const bubble = appendMessage("assistant", "");
    bubble.classList.add("is-typing");
    bubble.setAttribute("aria-busy", "true");

    controller = new AbortController();
    setBusy(true);
    let answer = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10) }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new ChatError(await describeError(response));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        bubble.classList.remove("is-typing");
        renderRich(bubble, answer);
        scrollToEnd();
      }
      answer += decoder.decode();
      if (!answer.trim()) throw new ChatError("The assistant returned an empty answer. Please try asking again.");
      renderRich(bubble, answer);
      history.push({ role: "assistant", content: answer.trim().slice(0, MAX_ASSISTANT) });
    } catch (error) {
      bubble.classList.remove("is-typing");
      if (error instanceof DOMException && error.name === "AbortError") {
        if (answer.trim()) {
          history.push({ role: "assistant", content: answer.trim().slice(0, MAX_ASSISTANT) });
        } else {
          bubble.remove();
          history.pop();
        }
      } else {
        history.pop();
        bubble.classList.add("msg--error");
        bubble.textContent =
          error instanceof ChatError ? error.message : "Couldn't reach the assistant. Check your connection and try again.";
      }
    } finally {
      bubble.removeAttribute("aria-busy");
      controller = null;
      setBusy(false);
      input.focus();
    }
  };

  const open = (prompt?: string) => {
    if (!dialog.open) dialog.showModal();
    if (prompt && !controller) {
      input.value = prompt;
      resize();
      void submit();
    } else {
      input.focus();
    }
  };

  document.addEventListener("click", (event) => {
    const trigger = (event.target as Element).closest<HTMLElement>("[data-ask-open]");
    if (!trigger) return;
    event.preventDefault();
    open(trigger.dataset.askPrompt);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || dialog.open) return;
    if ((event.target as Element).closest("input, textarea, select, [contenteditable='true']")) return;
    event.preventDefault();
    open();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelector("[data-ask-close]")?.addEventListener("click", () => dialog.close());

  dialog.querySelectorAll<HTMLButtonElement>("[data-ask-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.textContent?.trim() ?? "";
      void submit();
    });
  });

  input.addEventListener("input", () => {
    resize();
    updateCount();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      void submit();
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit();
  });
  stop.addEventListener("click", () => controller?.abort());
  reset.addEventListener("click", () => {
    controller?.abort();
    history.length = 0;
    log.querySelectorAll(".msg").forEach((message) => message.remove());
    intro.hidden = false;
    reset.hidden = true;
    input.focus();
  });

  updateCount();
}
