// Scenariusze demonstracyjne jednostki u18 (kontrakt, sekcja 6.6). Właściciel: u18.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek 3.2.1.1.1 do 3.2.1.1.4, 3.2.1.2.1 i 3.2.1.2.2.
import type { ScenariuszDemo, Ustawienia } from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const ANNA_NOWAK = '93041231085';
const TOMASZ_NOWAK = '90011555532';
const EMAIL_ANNY = 'anna.nowak@poczta.pl';

export const scenariuszeU18: readonly ScenariuszDemo[] = [
  {
    id: 'u18-anna-email-z-konta-zus',
    nazwa: tekst['u18-anna-email-z-konta-zus'].nazwa,
    opis: tekst['u18-anna-email-z-konta-zus'].opis,
    pesel: ANNA_NOWAK,
    zastosuj: () => ({ zus: { nadpisania: { emailEzus: EMAIL_ANNY } } }),
  },
  {
    id: 'u18-anna-sms-potwierdzony',
    nazwa: tekst['u18-anna-sms-potwierdzony'].nazwa,
    opis: tekst['u18-anna-sms-potwierdzony'].opis,
    pesel: ANNA_NOWAK,
    zastosuj: (ctx) => {
      const ustawienia: Ustawienia = {
        przypomnieniaWlaczone: true,
        wyprzedzenieDni: 3,
        kanalEmail: true,
        adresEmail: EMAIL_ANNY,
        adresEmailZrodlo: 'konto-zus',
        kanalSms: true,
        numerTelefonu: '600100200',
        stanNumeru: 'potwierdzony',
        numerPotwierdzony: '600100200',
        zapisano: ctx.teraz,
      };
      return { konto: { ustawienia }, zus: { nadpisania: { emailEzus: EMAIL_ANNY } } };
    },
  },
  {
    id: 'u18-tomasz-bez-adresu-email',
    nazwa: tekst['u18-tomasz-bez-adresu-email'].nazwa,
    opis: tekst['u18-tomasz-bez-adresu-email'].opis,
    pesel: TOMASZ_NOWAK,
    zastosuj: () => ({ zus: { nadpisania: { emailEzus: '' } } }),
  },
  {
    id: 'u18-tomasz-email-z-konta-zus',
    nazwa: tekst['u18-tomasz-email-z-konta-zus'].nazwa,
    opis: tekst['u18-tomasz-email-z-konta-zus'].opis,
    pesel: TOMASZ_NOWAK,
    zastosuj: () => ({ zus: { nadpisania: { emailEzus: 'tomasz.nowak@poczta.pl' } } }),
  },
];
