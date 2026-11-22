// Karta „Więcej informacji” z odnośnikami do serwisów informacyjnych instytucji (zus.pl, gov.pl, pip.gov.pl),
// otwieranymi w nowej karcie. Odnośniki pochodzą z ODNOSNIKI w katalogu świadczeń (dane/katalog/pozycje.ts).
import { Karta } from '@/komponenty/karta';
import { OdnosnikZewnetrzny } from '@/komponenty/odnosnik';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

export interface OdnosnikInformacyjny {
  etykieta: string;
  url: string;
}

function adresBezProtokolu(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function KartaWiecejInformacji({
  odnosniki,
  className,
}: {
  odnosniki: readonly OdnosnikInformacyjny[];
  className?: string;
}) {
  if (odnosniki.length === 0) return null;
  const t = teksty.wspolne.wiecejInformacji;
  return (
    <Karta tytul={t.tytul} bezLinii className={className}>
      <Stos>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {odnosniki.map((o) => (
            <li key={o.url} className="flex min-w-0 flex-col gap-1">
              <OdnosnikZewnetrzny href={o.url}>{o.etykieta}</OdnosnikZewnetrzny>
              <span className="text-small break-all text-ink-muted">{adresBezProtokolu(o.url)}</span>
            </li>
          ))}
        </ul>
        <p className="m-0 text-small">{t.wNowejKarcie}</p>
      </Stos>
    </Karta>
  );
}
