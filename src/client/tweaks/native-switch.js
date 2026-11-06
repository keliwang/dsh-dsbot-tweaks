import { languageIsChinese } from '../lib/dom.js';
import { borrowedActions } from '../lib/dsbot.js';
import { onBotSurface, switchToNativeSurface } from '../lib/surface.js';

/**
 * Native interface switch.
 *
 * Puts a round icon button right beside DS Bot's bottom-left settings gear, so
 * the native DSH interface is one click away instead of a settings page. It
 * only appears on the DS Bot surface; the native surface keeps its own DS Bot
 * return button.
 *
 * Clicking borrows DS Bot's own `actions.setSurface('agent')` (no reload) and
 * falls back to persisting the mode and reloading when that private seam is
 * unavailable.
 */
const FOOT_SELECTOR = '.bt-leftcol-foot';
const GEAR_SELECTOR = 'button.bt-account:not([data-dsbot-tweak])';
const ITEM_SELECTOR = '[data-dsbot-tweak="native-switch"]';

/** Same 20x20 stroke icon convention DS Bot uses for its own icons. */
function swapIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '15');
  svg.setAttribute('height', '15');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  for (const d of ['M4 7h11', 'M12 4l3 3-3 3', 'M16 13H5', 'M8 10l-3 3 3 3']) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }
  return svg;
}

/**
 * DS Bot's settings gear is button.bt-account with a circle span.bt-you
 * inside; reusing those classes gives the same size, hover and focus look.
 */
function createButton() {
  const zh = languageIsChinese();
  const title = zh
    ? '切换到 DSH 原生界面（经典 Agent 模式）'
    : 'Switch to the native DSH interface';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bt-account';
  button.setAttribute('data-dsbot-tweak', 'native-switch');
  button.setAttribute('aria-label', title);
  button.title = title;

  const circle = document.createElement('span');
  circle.className = 'bt-you';
  circle.setAttribute('aria-hidden', 'true');
  circle.appendChild(swapIcon());
  button.appendChild(circle);

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const gear = button.parentElement?.querySelector(GEAR_SELECTOR) ?? null;
    const actions = gear === null ? null : borrowedActions(gear);
    if (actions !== null) {
      try {
        // Same call DS Bot's Settings row makes; it also persists the mode.
        actions.setSurface('agent');
        return;
      } catch {
        // Fall through to the reload path below.
      }
    }
    switchToNativeSurface();
  });
  return button;
}

/** DS Bot renders the footer itself, so keep the button next to the gear. */
function placeBeside(parent, gear) {
  const item = parent.querySelector(ITEM_SELECTOR) || createButton();
  if (gear.nextElementSibling !== item) gear.after(item);
}

export function nativeSwitch() {
  return {
    id: 'native-switch',
    enabled: onBotSurface,
    apply() {
      let placed = false;
      for (const foot of document.querySelectorAll(FOOT_SELECTOR)) {
        const gear = foot.querySelector(GEAR_SELECTOR);
        if (gear === null) continue;
        placeBeside(foot, gear);
        placed = true;
      }
      if (placed) return;
      for (const box of document.querySelectorAll('.bt-foot-account')) {
        const gear = box.querySelector(GEAR_SELECTOR);
        if (gear === null) continue;
        placeBeside(box, gear);
      }
    },
  };
}
