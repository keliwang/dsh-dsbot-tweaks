/** DOM helpers shared by every client tweak. */

/** Whether the interface language is Chinese (drives the copy of injected UI). */
export function languageIsChinese() {
  const lang = (document.documentElement.lang || navigator.language || '').toLowerCase();
  return lang.startsWith('zh');
}

/**
 * Run every enabled tweak's apply() on the frame after the page changes, so a
 * tweak only describes what its UI should look like, never when to look.
 * apply() must be idempotent and cheap: it runs on every DOM mutation batch.
 *
 * @param {{ id: string, enabled: () => boolean, apply: () => void }[]} tweaks
 * @returns {() => void} disposer that stops watching
 */
export function watchDom(tweaks) {
  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      for (const tweak of tweaks) {
        try {
          if (!tweak.enabled()) continue;
          tweak.apply();
        } catch (error) {
          console.warn('[dsh-dsbot-tweaks]', tweak.id, error);
        }
      }
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  schedule();
  return () => observer.disconnect();
}
