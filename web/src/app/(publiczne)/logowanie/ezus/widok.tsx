'use client';

import { MakietaLogowania } from '../_czesci/makieta-logowania';
import { teksty } from '@/teksty';

// Ekran zastępczy makiety logowania loginem i hasłem eZUS (kontrakt 2.4). Właściciel: u01.
export function WidokLogowaniaEzus() {
  return <MakietaLogowania sposob="ezus" tytul={teksty.ViewEzusLogin.naglowek} />;
}
