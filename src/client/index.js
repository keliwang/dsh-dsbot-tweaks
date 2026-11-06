import { watchDom } from './lib/dom.js';
import { nativeSwitch } from './tweaks/native-switch.js';

/**
 * The tweak registry.
 *
 * Adding a tweak: write src/client/tweaks/<name>.js exporting a factory that
 * returns { id, enabled(), apply(), install? }, import it here, and add it to
 * TWEAKS. See docs/adding-a-tweak.md.
 */
const TWEAKS = [
  nativeSwitch(),
];

window.__ModuleLoader__.load({
  id: 'dsh-dsbot-tweaks',
  factory() {
    return {
      apply(ctx) {
        for (const tweak of TWEAKS) {
          if (typeof tweak.install !== 'function') continue;
          try {
            tweak.install();
          } catch (error) {
            console.warn('[dsh-dsbot-tweaks]', tweak.id, error);
          }
        }
        if (typeof ctx?.effect === 'function') {
          ctx.effect(() => watchDom(TWEAKS), 'dsh-dsbot-tweaks: DOM watcher');
        } else {
          watchDom(TWEAKS);
        }
      },
    };
  },
});
