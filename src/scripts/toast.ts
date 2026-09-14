export function toast(message: string): void {
  window.dispatchEvent(new CustomEvent<string>("toast", { detail: message }));
}
