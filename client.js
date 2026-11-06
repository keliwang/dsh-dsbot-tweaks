/* Generated from src/client by scripts/build-client.mjs. Edit the sources, then run `npm run build`. */
(() => {
  // src/client/lib/dom.js
  function languageIsChinese() {
    const lang = (document.documentElement.lang || navigator.language || "").toLowerCase();
    return lang.startsWith("zh");
  }
  function watchDom(tweaks) {
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
            console.warn("[dsh-dsbot-tweaks]", tweak.id, error);
          }
        }
      });
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    schedule();
    return () => observer.disconnect();
  }

  // src/client/lib/dsbot.js
  function borrowedActions(node) {
    for (const key of Object.keys(node)) {
      if (!key.startsWith("__reactFiber$") && !key.startsWith("__reactInternalInstance$")) continue;
      let fiber = node[key];
      for (let depth = 0; fiber && depth < 40; depth += 1, fiber = fiber.return) {
        const props = fiber.memoizedProps;
        if (!props) continue;
        if (typeof props.setSurface === "function") return props;
        for (const candidate of [props.actions, props.face?.actions]) {
          if (candidate && typeof candidate.setSurface === "function") return candidate;
        }
      }
      break;
    }
    return null;
  }

  // src/client/lib/surface.js
  var SURFACE_KEY = "ds-bot:surface";
  function onBotSurface() {
    try {
      return localStorage.getItem(SURFACE_KEY) !== "agent";
    } catch {
      return true;
    }
  }
  function switchToNativeSurface() {
    try {
      localStorage.setItem(SURFACE_KEY, "agent");
    } catch {
      return;
    }
    location.reload();
  }

  // src/client/tweaks/native-switch.js
  var FOOT_SELECTOR = ".bt-leftcol-foot";
  var GEAR_SELECTOR = "button.bt-account:not([data-dsbot-tweak])";
  var ITEM_SELECTOR = '[data-dsbot-tweak="native-switch"]';
  function swapIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "15");
    svg.setAttribute("height", "15");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.6");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    for (const d of ["M4 7h11", "M12 4l3 3-3 3", "M16 13H5", "M8 10l-3 3 3 3"]) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    }
    return svg;
  }
  function createButton() {
    const zh = languageIsChinese();
    const title = zh ? "\u5207\u6362\u5230 DSH \u539F\u751F\u754C\u9762\uFF08\u7ECF\u5178 Agent \u6A21\u5F0F\uFF09" : "Switch to the native DSH interface";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bt-account";
    button.setAttribute("data-dsbot-tweak", "native-switch");
    button.setAttribute("aria-label", title);
    button.title = title;
    const circle = document.createElement("span");
    circle.className = "bt-you";
    circle.setAttribute("aria-hidden", "true");
    circle.appendChild(swapIcon());
    button.appendChild(circle);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const gear = button.parentElement?.querySelector(GEAR_SELECTOR) ?? null;
      const actions = gear === null ? null : borrowedActions(gear);
      if (actions !== null) {
        try {
          actions.setSurface("agent");
          return;
        } catch {
        }
      }
      switchToNativeSurface();
    });
    return button;
  }
  function placeBeside(parent, gear) {
    const item = parent.querySelector(ITEM_SELECTOR) || createButton();
    if (gear.nextElementSibling !== item) gear.after(item);
  }
  function nativeSwitch() {
    return {
      id: "native-switch",
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
        for (const box of document.querySelectorAll(".bt-foot-account")) {
          const gear = box.querySelector(GEAR_SELECTOR);
          if (gear === null) continue;
          placeBeside(box, gear);
        }
      }
    };
  }

  // src/client/index.js
  var TWEAKS = [
    nativeSwitch()
  ];
  window.__ModuleLoader__.load({
    id: "dsh-dsbot-tweaks",
    factory() {
      return {
        apply(ctx) {
          for (const tweak of TWEAKS) {
            if (typeof tweak.install !== "function") continue;
            try {
              tweak.install();
            } catch (error) {
              console.warn("[dsh-dsbot-tweaks]", tweak.id, error);
            }
          }
          if (typeof ctx?.effect === "function") {
            ctx.effect(() => watchDom(TWEAKS), "dsh-dsbot-tweaks: DOM watcher");
          } else {
            watchDom(TWEAKS);
          }
        }
      };
    }
  });
})();
