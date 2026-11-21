// Scenariusze demonstracyjne jednostki u18 (kontrakt, sekcja 6.6). Właściciel: u18.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek 3.2.1.1.1, 3.2.1.1.2 i 3.2.1.2.1.
import type { ScenariuszDemo, Ustawienia } from '@/domena/typy';

const ANNA_NOWAK = '93041231085';
const TOMASZ_NOWAK = '90011555532';
const EMAIL_ANNY = 'anna.nowak@poczta.pl';

export const scenariuszeU18: readonly ScenariuszDemo[] = [
  {
    id: 'u18-anna-email-z-konta-zus',
    nazwa: 'Anna Nowak: adres e-mail anna.nowak@poczta.pl w danych konta ZUS',
    opis: 'Dane konta ZUS Anny Nowak zawierają adres anna.nowak@poczta.pl, a ustawienia przypomnień są domyślne: 7 dni, kanał e-mail, SMS wyłączony. Kod SMS w trybie demonstracyjnym to 482913.',
    pesel: ANNA_NOWAK,
    zastosuj: () => ({ zus: { nadpisania: { emailEzus: EMAIL_ANNY } } }),
  },
  {
    id: 'u18-anna-sms-potwierdzony',
    nazwa: 'Anna Nowak: e-mail i potwierdzony SMS 600100200',
    opis: 'Ustawienia przypomnień Anny Nowak z wyprzedzeniem 3 dni, kanałem e-mail anna.nowak@poczta.pl i kanałem SMS z numerem 600100200 potwierdzonym kodem.',
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
    nazwa: 'Tomasz Nowak: brak adresu e-mail w danych konta ZUS',
    opis: 'Dane konta ZUS Tomasza Nowaka nie zawierają adresu e-mail, a kanał SMS nie jest potwierdzony. Sekcja przypomnień pokazuje komunikat o braku adresu do przypomnień.',
    pesel: TOMASZ_NOWAK,
    zastosuj: () => ({ zus: { nadpisania: { emailEzus: '' } } }),
  },
];
