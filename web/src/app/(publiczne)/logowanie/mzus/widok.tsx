'use client';

import { MakietaLogowania } from '../_czesci/makieta-logowania';
import { teksty } from '@/teksty';

// Ekran zastępczy makiety logowania kodem z aplikacji mZUS (kontrakt 2.4). Właściciel: u01.
export function WidokLogowaniaKodemMzus() {
  return <MakietaLogowania sposob="mzus" tytul={teksty.ViewMzusCodeLogin.naglowek} />;
}
