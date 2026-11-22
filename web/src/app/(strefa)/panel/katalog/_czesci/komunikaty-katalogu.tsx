'use client';

// Komunikaty po przejściu na ViewCatalogList. Komunikat 0051 po zapisaniu wartości i 0082 po dodaniu pozycji
// mają odnośnik do zmienionego wiersza (wzory P04-05, P04-08, P04-11, P04-14).
import { PARAMETR_KOTWICY, PARAMETR_RODZAJU_ZMIANY } from '@/dane/magazyn/operacje/katalog';
import { rodzajWpisu } from '@/domena/katalog/edycja';
import type { Katalog } from '@/domena/typy';
import { Komunikat } from '@/komponenty/komunikat';
import type { KomunikatDoPokazania } from '@/komponenty/naglowek-strony';
import { trescKomunikatu } from '@/komponenty/typy-komunikatow';
import { teksty } from '@/teksty';

function etykietaOdnosnika(komunikat: KomunikatDoPokazania, katalog: Katalog): string | null {
  const zmiana = komunikat.parametry?.[PARAMETR_RODZAJU_ZMIANY];
  if (zmiana === undefined) return null;
  const t = teksty.ViewCatalogList.zobaczZmiane;
  if (komunikat.kod === '0082') return t.pozycja({ id: zmiana });
  if (komunikat.kod !== '0051') return null;
  if (katalog.pozycje.some((p) => p.id === zmiana)) return t.pozycja({ id: zmiana });
  const wpis = katalog.slowniki.find((w) => w.id === zmiana);
  return wpis ? t[rodzajWpisu(wpis)] : t.mieszany;
}

export function KomunikatyKatalogu({
  komunikaty,
  katalog,
}: {
  komunikaty: readonly KomunikatDoPokazania[];
  katalog: Katalog;
}) {
  if (komunikaty.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      {komunikaty.map((komunikat) => {
        const kotwica = komunikat.parametry?.[PARAMETR_KOTWICY];
        const etykieta = etykietaOdnosnika(komunikat, katalog);
        const tekst = trescKomunikatu(komunikat.kod, komunikat.parametry);
        return (
          <Komunikat
            key={komunikat.kod}
            kod={komunikat.kod}
            tresc={
              kotwica && etykieta ? (
                <>
                  {tekst}{' '}
                  <a href={`#${kotwica}`} className="font-semibold text-brand underline">
                    {etykieta}
                  </a>
                </>
              ) : (
                tekst
              )
            }
          />
        );
      })}
    </div>
  );
}
