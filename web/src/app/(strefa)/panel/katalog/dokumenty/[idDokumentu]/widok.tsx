'use client';

// ViewCatalogDocumentEdit: zmiana wpisu słownika dokumentów i adresatów wniosków (świadczenie albo wniosek, formy
// zatrudnienia, dokumenty i załączniki, adresat, termin). Dostęp konta bez roli Administrator rozstrzyga StrazDostepu (0047).
import { use } from 'react';
import { FormularzDokumentuKatalogu } from '@/app/(strefa)/panel/katalog/dokumenty/_czesci/formularz-dokumentu';
import { useKatalog } from '@/dane/magazyn/hooki';
import { formularzDokumentu } from '@/domena/katalog/edycja-panelu';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

export function WidokZmianyDokumentuKatalogu({ params }: { params: PageProps<'/panel/katalog/dokumenty/[idDokumentu]'>['params'] }) {
  const t = teksty.ViewCatalogDocumentEdit;
  const { idDokumentu } = use(params);
  const katalog = useKatalog();
  const wpis = katalog.dokumenty.find((d) => d.id === decodeURIComponent(idDokumentu));
  const lista = trasy.ViewCatalogList({ zakladka: 'dokumenty' });

  if (wpis === undefined) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowekZmiany} powrot={{ href: lista, etykieta: t.powrot }} />
        <Karta className="max-w-tresc">
          <div className="flex flex-col gap-6">
            <p className="m-0">{t.brakWpisu}</p>
            <div>
              <PrzyciskLink href={lista} wariant="drugorzedny">
                {t.powrot}
              </PrzyciskLink>
            </div>
          </div>
        </Karta>
      </>
    );
  }
  return <FormularzDokumentuKatalogu key={wpis.id} idDokumentu={wpis.id} poczatkowy={formularzDokumentu(wpis)} />;
}
