# Tablica kodów komunikatów do użytkownika

## Metadata

| Pole | Wartość |
| --- | --- |
| Wykonawca | Ryszard Kacperski |
| Właściciel merytoryczny | Ryszard Kacperski |
| Status | robocze |
| Wersja | 0.1.0 |
| Data ostatniej aktualizacji |  |

**Tablica zawiera treść każdego komunikatu dla użytkownika, do którego odwołują się User Stories nazwą sytuacji i kodem.** Kolumna ID zawiera czterocyfrowy kod komunikatu nadawany kolejno od 0001, Nazwa opisuje sytuację, której dotyczy komunikat, Typ przyjmuje wartość ERROR, WARNING albo INFO, Kod HTTP wskazuje kod odpowiedzi systemu, a Wiadomość zawiera treść pokazywaną użytkownikowi. Story, które wprowadza nową sytuację, dodaje wiersz z kolejnym wolnym kodem, a ta sama nazwa sytuacji oznacza w całym Epiku ten sam komunikat.

| ID | Nazwa | Typ | Kod HTTP | Wiadomość |
| --- | --- | --- | --- | --- |
