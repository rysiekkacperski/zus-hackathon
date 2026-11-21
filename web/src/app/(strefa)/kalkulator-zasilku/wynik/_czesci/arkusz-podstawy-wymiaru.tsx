'use client';

// SheetCalcBaseSource (kontrakt, tabela 2.3): arkusz na ViewCalcMaternityResult. Właściciel: u15.
// Źródło podstawy wymiaru wybranego rodzica, wyliczenie z konta ZUS, podstawa wpisana i pełny etat (historyjka 3.10.4.1.2).
import { useState } from 'react';
import { formatujDate } from '@/domena/daty';
import { parsujKwote } from '@/domena/kwoty';
import type { KodKomunikatu, RodzicWRodzinie } from '@/domena/typy';
import { formatujKwote } from '@/komponenty/format';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Komunikat } from '@/komponenty/komunikat';
import { Arkusz } from '@/komponenty/okno';
import { PoleKwoty } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { trescKomunikatu } from '@/komponenty/typy-komunikatow';
import { teksty } from '@/teksty';
import type { PodstawaRodzica } from '../../_czesci/podstawy';

const t = teksty.SheetCalcBaseSource;
const MAKS_GROSZE = 9_999_999;

export type ZrodloWyboru = 'konto-zus' | 'wpisana' | 'przykladowa-sprawa';

export interface ZapisPodstawy {
  rodzic: RodzicWRodzinie;
  zrodlo: ZrodloWyboru;
  kwota?: number;
  pelnyEtat: boolean;
}

export interface ArkuszPodstawyWymiaruProps {
  otwarte: boolean;
  onZamknij: () => void;
  podstawa?: PodstawaRodzica;
  etykietaRodzica?: string;
  pracownik?: boolean;
  opisTytulu?: string;
  dzis?: string;
  onZapisz?: (z: ZapisPodstawy) => void;
}

export function ArkuszPodstawyWymiaru(props: ArkuszPodstawyWymiaruProps) {
  if (!props.otwarte || !props.podstawa) return null;
  return <TrescArkusza key={props.podstawa.rodzic} {...props} podstawa={props.podstawa} />;
}

function TrescArkusza({
  otwarte,
  onZamknij,
  podstawa,
  etykietaRodzica,
  pracownik = false,
  opisTytulu,
  dzis,
  onZapisz,
}: ArkuszPodstawyWymiaruProps & { podstawa: PodstawaRodzica }) {
  const zKontaDostepne = podstawa.zKonta.rodzaj === 'wyliczona';
  const efektywna = podstawa.efektywna;
  const zSprawy = efektywna?.zrodlo === 'przykladowa-sprawa';
  const domyslne: ZrodloWyboru = zSprawy
    ? 'przykladowa-sprawa'
    : efektywna?.zrodlo === 'konto-zus' && zKontaDostepne
      ? 'konto-zus'
      : zKontaDostepne && !efektywna
        ? 'konto-zus'
        : 'wpisana';
  const [zrodlo, ustawZrodlo] = useState<ZrodloWyboru>(domyslne);
  const [kwota, ustawKwote] = useState(
    efektywna?.zrodlo === 'wartosc-wpisana-przez-rodzica' ? formatujKwote(efektywna.kwota).replace(/\s?zł$/u, '') : '',
  );
  const [pelnyEtat, ustawPelnyEtat] = useState(podstawa.pelnyEtat);
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);

  const kodBraku = podstawa.zKonta.rodzaj === 'brak' ? podstawa.zKonta.kod : null;
  const tytul = etykietaRodzica ? t.tytulRodzica({ rodzic: etykietaRodzica }) : t.tytul;

  function zapisz() {
    if (zrodlo === 'wpisana') {
      if (kwota.trim() === '') {
        ustawBlad('0093');
        document.getElementById('podstawa-kwota')?.focus();
        return;
      }
      const g = parsujKwote(kwota);
      if (g === null || g <= 0 || g > MAKS_GROSZE) {
        ustawBlad('0016');
        document.getElementById('podstawa-kwota')?.focus();
        return;
      }
      onZapisz?.({ rodzic: podstawa.rodzic, zrodlo, kwota: g, pelnyEtat });
    } else {
      onZapisz?.({ rodzic: podstawa.rodzic, zrodlo, pelnyEtat });
    }
    onZamknij();
  }

  const opcje = [
    {
      wartosc: 'konto-zus' as const,
      etykieta: t.kontoZus,
      opis: zKontaDostepne
        ? t.kontoZusOpis
        : kodBraku === '0173'
          ? t.kontoZusNiedostepneDrugi
          : t.kontoZusNiedostepneBrakSkladek,
      wylaczona: !zKontaDostepne,
    },
    ...(zSprawy ? [{ wartosc: 'przykladowa-sprawa' as const, etykieta: t.przykladowaSprawa, opis: t.przykladowaSprawaOpis }] : []),
    { wartosc: 'wpisana' as const, etykieta: t.wpisana, opis: t.wpisanaOpis },
  ];

  const wyliczona = podstawa.zKonta.rodzaj === 'wyliczona' ? podstawa.zKonta.podstawa : null;

  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={tytul}
      stopka={
        <div className="flex flex-wrap justify-end gap-4">
          <Przycisk type="button" wariant="drugorzedny" onClick={onZamknij}>
            {t.anuluj}
          </Przycisk>
          <Przycisk type="button" wariant="glowny" onClick={zapisz}>
            {t.zapisz}
          </Przycisk>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {dzis ? <p className="m-0 text-body">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p> : null}
        {kodBraku ? <Komunikat kod={kodBraku} tresc={trescKomunikatu(kodBraku)} /> : null}
        <GrupaOpcji<ZrodloWyboru>
          nazwa="podstawa-zrodlo"
          legenda={t.zrodloLegenda}
          opcje={opcje}
          wartosc={zrodlo}
          onZmiana={(w) => {
            ustawZrodlo(w);
            ustawBlad(null);
          }}
        />
        {zrodlo === 'wpisana' ? (
          <PoleKwoty
            id="podstawa-kwota"
            etykieta={t.kwota}
            podpowiedz={t.kwotaPodpowiedz}
            wartosc={kwota}
            onZmiana={(w) => {
              ustawKwote(w);
              ustawBlad(null);
            }}
            blad={blad}
            szerokosc="srednia"
          />
        ) : null}
        {pracownik ? (
          <GrupaOpcji<'tak' | 'nie'>
            nazwa="podstawa-pelny-etat"
            legenda={podstawa.rodzic === 'matka' ? t.pelnyEtatLegenda : t.pelnyEtatLegendaDrugi}
            uklad="poziomo"
            opcje={[
              { wartosc: 'tak', etykieta: t.tak },
              { wartosc: 'nie', etykieta: t.nie },
            ]}
            wartosc={pelnyEtat ? 'tak' : 'nie'}
            onZmiana={(w) => ustawPelnyEtat(w === 'tak')}
          />
        ) : null}
        {zrodlo === 'konto-zus' && wyliczona ? (
          <div className="w-full min-w-0 overflow-x-auto" role="region" aria-label={t.tabelaPrzewijanie} tabIndex={0}>
            <table className="w-full border-collapse text-body">
              <caption className="mb-3 text-left text-body-strong text-ink">{t.tabelaPodpis}</caption>
              <tbody>
                {opisTytulu ? (
                  <tr className="border-b border-line-row">
                    <th scope="row" className="py-3 pr-4 text-left font-normal">
                      {t.tytulUbezpieczenia}
                    </th>
                    <td className="py-3">{opisTytulu}</td>
                  </tr>
                ) : null}
                {(wyliczona.skladniki ?? []).map((s) => (
                  <tr key={s.opis} className="border-b border-line-row">
                    <th scope="row" className="py-3 pr-4 text-left font-normal">
                      {s.opis}
                    </th>
                    <td className="py-3 text-right whitespace-nowrap">{formatujKwote(s.kwota)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="py-3 pr-4 text-left font-semibold">
                    {t.podstawaZasilku}
                  </th>
                  <td className="py-3 text-right font-semibold whitespace-nowrap">{formatujKwote(wyliczona.kwota)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </Arkusz>
  );
}
