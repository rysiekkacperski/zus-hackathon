import { DostawcaKomunikatowChwilowych } from "@/komponenty/komunikat-chwilowy";
import { DostawcaKomunikatowPoPrzejsciu } from "@/komponenty/rama/komunikaty-po-przejsciu";
import { LinkDoTresci } from "@/komponenty/rama/link-do-tresci";
import { NaglowekPubliczny } from "@/komponenty/rama/naglowek";
import { StrazPubliczna } from "@/komponenty/rama/straz-dostepu";

// Ekrany przed zalogowaniem. Strażnik i dostawcy komunikatów owijają treść strony bez zawieszania,
// więc segment strony renderuje się podczas prerenderu.
export default function UkladPubliczny({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <LinkDoTresci />
      <NaglowekPubliczny />
      <main id="tresc" className="w-full min-w-0 flex-1 px-4 pt-6 pb-16 lg:px-16">
        <div className="mx-auto max-w-tresc min-w-0">
          <DostawcaKomunikatowChwilowych>
            <DostawcaKomunikatowPoPrzejsciu>
              <StrazPubliczna>{children}</StrazPubliczna>
            </DostawcaKomunikatowPoPrzejsciu>
          </DostawcaKomunikatowChwilowych>
        </div>
      </main>
    </div>
  );
}
