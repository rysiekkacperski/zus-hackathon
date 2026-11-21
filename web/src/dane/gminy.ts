// Słownik gmin (kontrakt, sekcje 8 i 13.2 pkt 5). Właściciel: u10 (Profil na start: ciąża, zmiana zatrudnienia, rodzina).
// Podzbiór rejestru TERYT do czasu dostarczenia pełnej listy przez zespół: gminy z kryteriów akceptacji
// (Bydgoszcz, Gniew, Gniewkowo) i gminy adresów kont przykładowych (Poznań, Łódź, Gdańsk, Gdynia, Kraków).
// Identyfikatory TERYT (WWPPGGR) zespół potwierdza przy zastąpieniu podzbioru pełnym rejestrem.
import type { Gmina } from '@/domena/typy';

export const gminy: Gmina[] = [
  {
    idTeryt: '0461011',
    nazwa: 'Bydgoszcz',
    powiat: 'Bydgoszcz',
    wojewodztwo: 'kujawsko-pomorskie',
    urzadStanuCywilnegoMiejscownik: 'w Bydgoszczy',
  },
  {
    idTeryt: '2214023',
    nazwa: 'Gniew',
    powiat: 'tczewski',
    wojewodztwo: 'pomorskie',
    urzadStanuCywilnegoMiejscownik: 'w Gniewie',
  },
  {
    idTeryt: '0407033',
    nazwa: 'Gniewkowo',
    powiat: 'inowrocławski',
    wojewodztwo: 'kujawsko-pomorskie',
    urzadStanuCywilnegoMiejscownik: 'w Gniewkowie',
  },
  {
    idTeryt: '3064011',
    nazwa: 'Poznań',
    powiat: 'Poznań',
    wojewodztwo: 'wielkopolskie',
    urzadStanuCywilnegoMiejscownik: 'w Poznaniu',
  },
  {
    idTeryt: '1061011',
    nazwa: 'Łódź',
    powiat: 'Łódź',
    wojewodztwo: 'łódzkie',
    urzadStanuCywilnegoMiejscownik: 'w Łodzi',
  },
  {
    idTeryt: '2261011',
    nazwa: 'Gdańsk',
    powiat: 'Gdańsk',
    wojewodztwo: 'pomorskie',
    urzadStanuCywilnegoMiejscownik: 'w Gdańsku',
  },
  {
    idTeryt: '2262011',
    nazwa: 'Gdynia',
    powiat: 'Gdynia',
    wojewodztwo: 'pomorskie',
    urzadStanuCywilnegoMiejscownik: 'w Gdyni',
  },
  {
    idTeryt: '1261011',
    nazwa: 'Kraków',
    powiat: 'Kraków',
    wojewodztwo: 'małopolskie',
    urzadStanuCywilnegoMiejscownik: 'w Krakowie',
  },
];
