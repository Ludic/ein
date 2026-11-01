/**
 * Vite plugin that hot-reloads ein systems and components. Add it to `plugins`
 * and call `installHmr(engine)` from `@ludic/ein/hmr` in the app.
 */
import type { Plugin } from 'vite'

export interface EinPluginOptions {
  /**
   * Decide which modules get hot-reload support. By default a module qualifies
   * when it imports from `@ludic/ein` or contains an `@ein-hmr` comment.
   */
  include?: (id: string, code: string) => boolean
}

export type ExportBinding = [exported: string, local: string]

const SCRIPT_ID = /\.[cm]?[jt]sx?(?:\?.*)?$/
const IMPORTS_EIN = /\bfrom\s*['"]@ludic\/ein(?:\/[\w-]+)?['"]/
const MARKER = /@ein-hmr\b/
const EXPORT_DECLARATION =
  /\bexport\s+(default\s+)?(?:abstract\s+)?(?:class|function\s*\*?|async\s+function|const|let|var)\s+([A-Za-z_$][\w$]*)/g
const EXPORT_LIST = /\bexport\s*\{([^}]*)\}(?!\s*from\b)/g

/** Names a module exports, paired with the local identifier behind each one. Re-exports are skipped. */
export function exportedBindings(code: string): ExportBinding[] {
  const bindings = new Map<string, string>()
  for (const match of code.matchAll(EXPORT_DECLARATION)) {
    const [, isDefault, local] = match
    bindings.set(isDefault ? 'default' : local!, local!)
  }
  for (const match of code.matchAll(EXPORT_LIST)) {
    for (const entry of match[1]!.split(',')) {
      const parts = entry.trim().split(/\s+as\s+/)
      const local = parts[0]?.trim()
      if (!local) continue
      const exported = parts[1]?.trim() ?? local
      bindings.set(exported, local)
    }
  }
  return [...bindings]
}

/** The code appended to a module to make it self-accepting. */
export function hmrSnippet(bindings: readonly ExportBinding[]): string {
  const prev = bindings
    .map(([exported, local]) => `${JSON.stringify(exported)}: ${local}`)
    .join(', ')
  return `
// @ludic/ein hot module replacement
if (import.meta.hot) {
  const __ein_prev = { ${prev} };
  import.meta.hot.accept((mod) => {
    if (!mod) return;
    const runtime = globalThis.__EIN_HMR__;
    if (!runtime) { import.meta.hot.invalidate('ein: hmr runtime not installed'); return; }
    try { runtime.reload(__ein_prev, mod); }
    catch (error) { console.error(error); import.meta.hot.invalidate('ein: hot reload failed'); }
  });
}
`
}

export function shouldTransform(id: string, code: string, options: EinPluginOptions = {}): boolean {
  if (id.includes('/node_modules/') || !SCRIPT_ID.test(id)) return false
  return IMPORTS_EIN.test(code) || MARKER.test(code) || (options.include?.(id, code) ?? false)
}

export function transformModule(
  id: string,
  code: string,
  options: EinPluginOptions = {},
): string | null {
  if (!shouldTransform(id, code, options)) return null
  const bindings = exportedBindings(code)
  if (bindings.length === 0) return null
  return code + hmrSnippet(bindings)
}

export default function ein(options: EinPluginOptions = {}): Plugin {
  return {
    name: 'ein:hmr',
    apply: 'serve',
    enforce: 'post',
    transform(code, id) {
      const result = transformModule(id, code, options)
      return result === null ? null : { code: result, map: null }
    },
  }
}
