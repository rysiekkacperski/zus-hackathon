'use client';

import { MakietaLogowania } from '../_czesci/makieta-logowania';
import { teksty } from '@/teksty';

// Ekran zastępczy makiety logowania przez mObywatela (kontrakt 2.4). Właściciel: u01.
export function WidokLogowaniaMobywatel() {
  return <MakietaLogowania sposob="mobywatel" tytul={teksty.ViewMobywatelLogin.naglowek} />;
}
