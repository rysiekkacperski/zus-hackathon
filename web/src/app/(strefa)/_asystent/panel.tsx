'use client';

import { useId } from 'react';
import { PrzyciskIkona } from '@/komponenty/przycisk-ikona';
import { teksty } from '@/teksty';

export interface PanelAsystentaProps {
  id: string;
  otwarty: boolean;
  onZamknij: () => void;
}

// Zaślepka fundamentu: panel asystenta AI (sekcja 3.3) buduje jednostka u31 w miejscu tej zaślepki,
// z zachowaniem nazwy eksportu i propsów. Zaślepka pokazuje niemodalne okno z tytułem i zamknięciem,
// żeby przycisk asystenta w ramie miał działający cel aria-controls.
export function PanelAsystenta({ id, otwarty, onZamknij }: PanelAsystentaProps) {
  const idTytulu = useId();
  return (
    <section
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={idTytulu}
      hidden={!otwarty}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onZamknij();
      }}
      className="fixed inset-0 z-40 flex flex-col gap-4 bg-surface-card p-5 shadow-header md:inset-auto md:right-6 md:bottom-24 md:max-h-[calc(100vh-128px)] md:w-panel-asystenta md:max-w-[calc(100vw-48px)] md:rounded-md md:border md:border-line"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id={idTytulu} className="m-0 text-section-title text-ink">
          {teksty.ViewAssistantChat.naglowek}
        </h2>
        <PrzyciskIkona ksztalt="okragly" ikona="zamknij" etykieta={teksty.rama.zamknijAsystenta} onClick={onZamknij} />
      </div>
      <p className="m-0">{teksty.wspolne.ekranZastepczy.element({ jednostka: 'u31' })}</p>
    </section>
  );
}
