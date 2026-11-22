// Kreator ZAM: wysyłka bez numeru rachunku (przekaz pocztowy) przez POST /api/v1/zus/wnioski, blokada błędnego numeru,
// załączniki komunikatu 0149 i liczba części kroku Dane.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { WniosekZam } from '@/domena/typy';
import { zalacznikiZam } from '@/domena/wnioski/zam';
import { liczbaCzesciEkranuZam } from '@/domena/wnioski/zam-nawigacja';
import { DZIS } from './pomocnicze';

const trasa = await import('@/app/api/v1/zus/wnioski/route');
const { brakiPodsumowaniaZam } = await import('@/app/(strefa)/wnioski/zam/podsumowanie/_czesci/zakladki-podsumowania');

const PESEL = '93041231085';
const RACHUNEK_POPRAWNY = '61109010140000071219812874';
const RACHUNEK_BLEDNY = '61109010140000071219812875';

function wniosekZam(nadpisz: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    rodzaj: 'zam',
    idSprawy: 'K1',
    konto: PESEL,
    stan: 'szkic',
    rodzajUrlopu: 'macierzynski',
    okresy: [{ od: '2026-11-10', do: '2027-03-29' }],
    daneDzieci: [{ imie: 'Anna', nazwisko: 'Nowak' }],
    zalaczniki: [],
    oswiadczeniaPotwierdzone: true,
    ...nadpisz,
  };
}

function wyslij(wniosek: Record<string, unknown>) {
  return trasa.POST(
    new Request('http://localhost/api/v1/zus/wnioski', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dzis: DZIS, wniosek }),
    }),
  );
}

test('POST /api/v1/zus/wnioski przyjmuje ZAM bez numeru rachunku i z poprawnym numerem', async () => {
  for (const wniosek of [wniosekZam(), wniosekZam({ numerRachunku: '' }), wniosekZam({ numerRachunku: RACHUNEK_POPRAWNY })]) {
    const odpowiedz = await wyslij(wniosek);
    assert.equal(odpowiedz.status, 201);
    const tresc = (await odpowiedz.json()) as { stan: string; potwierdzenie: string };
    assert.equal(tresc.stan, 'wyslany');
    assert.match(tresc.potwierdzenie, /^ZAM-DEMO-\d{8}-\d{4}$/);
  }
});

test('POST /api/v1/zus/wnioski odrzuca ZAM z błędnym numerem rachunku', async () => {
  for (const [numer, kod] of [[RACHUNEK_BLEDNY, '0041'], ['12 3456', '0040']] as const) {
    const odpowiedz = await wyslij(wniosekZam({ numerRachunku: numer }));
    assert.equal(odpowiedz.status, 400);
    assert.ok(JSON.stringify(await odpowiedz.json()).includes(kod));
  }
});

test('podsumowanie ZAM blokuje wysyłkę tylko przy błędnym numerze rachunku', () => {
  const wniosek = (numerRachunku?: string) => wniosekZam({ numerRachunku }) as unknown as WniosekZam;
  assert.equal(brakiPodsumowaniaZam(wniosek()).rachunek, undefined);
  assert.equal(brakiPodsumowaniaZam(wniosek(RACHUNEK_POPRAWNY)).rachunek, undefined);
  assert.equal(brakiPodsumowaniaZam(wniosek(RACHUNEK_BLEDNY)).rachunek, '0041');
});

test('komunikat 0149 pomija zaświadczenie lekarskie dołączone plikiem', () => {
  const przedPorodem = { dzienPoczatkuZasilku: '2026-12-01', przewidywanyTerminPorodu: '2026-12-15', liczbaDzieci: 1 };
  const bezPliku = wniosekZam({ przedPorodem }) as unknown as WniosekZam;
  const zPlikiem = wniosekZam({
    przedPorodem: {
      ...przedPorodem,
      zaswiadczenie: { id: 'z', rodzaj: 'zaswiadczenie-lekarskie', plik: { idPliku: 'p', nazwa: 'z.pdf', rozmiar: 15, typ: 'application/pdf' } },
    },
  }) as unknown as WniosekZam;
  assert.deepEqual(zalacznikiZam({ wniosek: bezPliku, adresat: 'zus' }), ['zaswiadczenie-lekarskie']);
  assert.deepEqual(zalacznikiZam({ wniosek: zPlikiem, adresat: 'zus' }), []);
});

test('krok Dane ZAM ma osobne części wnioskodawcy i rachunku oraz dwie części na każde dziecko', () => {
  const warunki = { okresWDwochCzesciach: false, zZaswiadczeniem: false };
  assert.equal(liczbaCzesciEkranuZam('ViewZamData', { ...warunki, liczbaDzieciZDanymi: 0 }), 2);
  assert.equal(liczbaCzesciEkranuZam('ViewZamData', { ...warunki, liczbaDzieciZDanymi: 1 }), 4);
  assert.equal(liczbaCzesciEkranuZam('ViewZamData', { ...warunki, liczbaDzieciZDanymi: 2 }), 6);
});
