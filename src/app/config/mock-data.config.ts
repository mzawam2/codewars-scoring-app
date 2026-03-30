// Global configuration that can be set before app initialization
declare global {
  interface Window {
    __MOCK_DATA_ENABLED__?: boolean;
  }
}

export function isMockDataEnabled(): boolean {
  return window.__MOCK_DATA_ENABLED__ === true;
}
