// Pobiera plik w przeglądarce przez tymczasowy element a z adresem obiektu Blob.
export function pobierzPlik(nazwa: string, typ: string, zawartosc: BlobPart | Blob): void {
  if (typeof window === 'undefined') return;
  const blob = zawartosc instanceof Blob && zawartosc.type === typ ? zawartosc : new Blob([zawartosc], { type: typ });
  const adres = URL.createObjectURL(blob);
  const odnosnik = document.createElement('a');
  odnosnik.href = adres;
  odnosnik.download = nazwa;
  odnosnik.rel = 'noopener';
  odnosnik.style.display = 'none';
  document.body.appendChild(odnosnik);
  odnosnik.click();
  odnosnik.remove();
  window.setTimeout(() => URL.revokeObjectURL(adres), 1000);
}
