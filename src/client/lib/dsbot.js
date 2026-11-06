/**
 * Borrowing DS Bot's own React actions.
 *
 * DS Bot's client module exports only `apply` / `inject` (its Cordis plugin
 * face). The actions it uses internally — for example `setSurface('agent')`,
 * the same call the Settings row makes — live in its plugin closure and are
 * handed to its own React components only. They are not a Cordis service, not
 * on `window`, and not importable.
 *
 * React keeps the props of every rendered component on each DOM node's fiber,
 * so a React-rendered node DS Bot owns can lend those actions to a tweak.
 * Walking up from that node, the first component carrying `actions.setSurface`
 * gives the same action without any reload.
 *
 * This is a private seam: if React or DS Bot changes its fiber shape, callers
 * must fall back to their reload path.
 *
 * @param {Element} node a React-rendered node owned by DS Bot
 * @returns {{ setSurface: (mode: string) => void } | null}
 */
export function borrowedActions(node) {
  for (const key of Object.keys(node)) {
    if (!key.startsWith('__reactFiber$') && !key.startsWith('__reactInternalInstance$')) continue;
    let fiber = node[key];
    for (let depth = 0; fiber && depth < 40; depth += 1, fiber = fiber.return) {
      const props = fiber.memoizedProps;
      if (!props) continue;
      if (typeof props.setSurface === 'function') return props;
      for (const candidate of [props.actions, props.face?.actions]) {
        if (candidate && typeof candidate.setSurface === 'function') return candidate;
      }
    }
    break;
  }
  return null;
}
