import { Logo } from '@/komponenty/rama/naglowek';
import { teksty } from '@/teksty';

// Statyczna powłoka ramy wyświetlana do chwili wyrenderowania RamaAplikacji w przeglądarce.
export function SzkieletRamy() {
  return (
    <div className="grid min-h-dvh grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] lg:grid-cols-[var(--spacing-sidebar)_minmax(0,1fr)]">
      <header className="relative z-20 col-span-full flex h-header items-center bg-surface-card px-3 shadow-header md:px-7.5">
        <Logo href="/" />
      </header>
      <div aria-hidden="true" className="hidden bg-brand lg:block" />
      <main id="tresc" aria-busy="true" className="min-w-0 px-4 pt-6 pb-16 lg:px-16">
        <p className="sr-only" role="status">
          {teksty.rama.ladowanie}
        </p>
        <div aria-hidden="true" className="flex max-w-tresc min-w-0 flex-col gap-6 pt-10">
          <div className="h-8 w-full max-w-90 rounded-sm bg-line-soft" />
          <div className="h-48 w-full rounded-md bg-surface-card" />
          <div className="h-32 w-full rounded-md bg-surface-card" />
        </div>
      </main>
    </div>
  );
}
