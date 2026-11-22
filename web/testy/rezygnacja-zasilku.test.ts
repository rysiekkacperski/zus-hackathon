// Rezygnacja matki z dalszej części zasiłku macierzyńskiego (u34): oświadczenie ojca dziecka do wydruku po ponownym
// otwarciu zapisanej rezygnacji pokazuje imię i nazwisko wpisane przez matkę w formularzu i zapisane we wniosku.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { WniosekOUrlop } from '@/domena/typy';
import { ojciecZRezygnacji } from '@/domena/wnioski/zas23';

const rezygnacja = (ojciec?: string): Pick<WniosekOUrlop, 'rezygnacja'> => ({
  rezygnacja: { dataPowrotu: '2027-02-16', zOrzeczeniem: false, ...(ojciec === undefined ? {} : { ojciec }) },
});

test('zapisana rezygnacja przy pustym profilu podaje imię ojca wpisane w formularzu', () => {
  assert.equal(ojciecZRezygnacji(rezygnacja('Jan Kowalski'), ''), 'Jan Kowalski');
});

test('zapisana rezygnacja ma pierwszeństwo przed innym imieniem ojca w profilu', () => {
  assert.equal(ojciecZRezygnacji(rezygnacja('Jan Kowalski'), 'Piotr Nowak'), 'Jan Kowalski');
});

test('wniosek zapisany bez imienia ojca podaje imię ojca z profilu', () => {
  assert.equal(ojciecZRezygnacji(rezygnacja(), 'Piotr Nowak'), 'Piotr Nowak');
  assert.equal(ojciecZRezygnacji(rezygnacja('  '), 'Piotr Nowak'), 'Piotr Nowak');
  assert.equal(ojciecZRezygnacji({}, ''), '');
});
