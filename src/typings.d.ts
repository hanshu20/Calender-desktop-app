export {};

declare global {
  interface Window {
    electronAPI?: {
      notify: (payload: { title: string; body: string }) => Promise<void> | void;
    };
  }
}
