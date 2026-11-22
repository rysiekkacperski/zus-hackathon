import { Suspense } from "react";
import { RamaAplikacji } from "@/komponenty/rama/rama-aplikacji";
import { SzkieletRamy } from "@/komponenty/rama/szkielet-ramy";

export default function UkladStrefy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SzkieletRamy />}>
      <RamaAplikacji>{children}</RamaAplikacji>
    </Suspense>
  );
}
