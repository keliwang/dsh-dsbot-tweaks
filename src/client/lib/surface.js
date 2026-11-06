/**
 * DS Bot's surface state.
 *
 * DS Bot keeps the active surface in localStorage under "bot" (team UI) or
 * "agent" (native DSH UI). Tweaks that only belong to the team UI gate
 * themselves with onBotSurface().
 */
export const SURFACE_KEY = 'ds-bot:surface';

/** Whether the page currently shows the DS Bot surface (not the native one). */
export function onBotSurface() {
  try {
    return localStorage.getItem(SURFACE_KEY) !== 'agent';
  } catch {
    return true;
  }
}

/**
 * Reload-based fallback switch: persist the mode, then rebuild the page on the
 * native surface. Used only when DS Bot's own action cannot be borrowed.
 */
export function switchToNativeSurface() {
  try {
    localStorage.setItem(SURFACE_KEY, 'agent');
  } catch {
    return;
  }
  location.reload();
}
