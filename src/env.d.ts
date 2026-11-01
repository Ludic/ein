// Temporary ambient typings for the Vite-specific globals used by the 1.x source.
// Removed in the 2.0 core rewrite, where dev tooling moves to the `vite` and `hmr` entries.
interface ImportMeta {
  readonly env?: { readonly DEV?: boolean }
  readonly hot?: {
    send(event: string, data?: unknown): void
    accept(cb?: (mod: unknown) => void): void
    on(event: string, cb: (data: unknown) => void): void
  }
}
