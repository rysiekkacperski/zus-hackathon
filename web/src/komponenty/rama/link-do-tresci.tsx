import { teksty } from '@/teksty';

// Pierwszy element każdej ramy: link „Przejdź do treści” wysuwany na ekran po otrzymaniu fokusu.
export function LinkDoTresci() {
  return (
    <a
      href="#tresc"
      className="fixed top-2 left-2 z-50 -translate-y-[calc(100%+1rem)] rounded-sm bg-surface-card px-4 py-2 text-body-strong text-brand shadow-header focus:translate-y-0"
    >
      {teksty.rama.przejdzDoTresci}
    </a>
  );
}
