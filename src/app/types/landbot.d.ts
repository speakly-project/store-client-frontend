export {};

declare global {
  interface Window {
    Landbot?: { Livechat?: new (args: { configUrl: string }) => unknown };
    initLandbot?: () => void;
  }
}
