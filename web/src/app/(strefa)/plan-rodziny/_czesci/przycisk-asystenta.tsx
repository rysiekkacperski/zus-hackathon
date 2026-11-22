'use client';

// Akcja „Zapytaj asystenta, co zrobić” przy ostrzeżeniach strażnika (wzory P06-05 i P06-08).
// Otwiera panel asystenta w ramie przez stan sesji. Właściciel: u12.
import { zapiszStanSesji } from '@/dane/magazyn/operacje/sesja';
import { useStanSesji } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

export function PrzyciskAsystenta() {
  const stanSesji = useStanSesji();
  if (!stanSesji) return null;
  const otworz = () => {
    zapiszStanSesji({ panelAsystenta: { ...stanSesji.panelAsystenta, otwarty: true } }, pobierzKontekstOperacji());
  };
  return (
    <Przycisk wariant="drugorzedny" onClick={otworz}>
      {teksty.ViewFamilyPlan.straznik.zapytajAsystenta}
    </Przycisk>
  );
}
