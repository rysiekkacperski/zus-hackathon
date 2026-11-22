import { teksty } from '@/teksty';

// Pierwszy element każdej ramy: link „Przejdź do treści” wysuwany na ekran po otrzymaniu fokusu. Ukryty link
// stoi poza oknem z zapasem na rozmycie cienia, a cień dostaje dopiero z fokusem.
export function LinkDoTresci() {
  return (
    <a
      href="#tresc"
      className="fixed top-2 left-2 z-50 -translate-y-[calc(100%+3rem)] rounded-sm bg-surface-card px-4 py-2 text-body-strong text-brand shadow-none focus:translate-y-0 focus:shadow-header"
    >
      {teksty.rama.przejdzDoTresci}
    </a>
  );
}
