/**
 * Default backend API URL used by server-side route handlers.
 */
export const DEFAULT_BACKEND_URL = 'https://atar-api.mobileappdevelopmentindia.com';

/**
 * Resolves the backend URL without exposing server-only configuration to the browser.
 */
export function getBackendBaseUrl(): string {
  const configuredUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (configuredUrl?.trim() || DEFAULT_BACKEND_URL).replace(/\/+$/, '');
}
