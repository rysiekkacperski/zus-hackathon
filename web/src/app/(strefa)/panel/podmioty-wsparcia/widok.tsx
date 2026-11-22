'use client';

// ViewCatalogSupportOrganizations (kontrakt, tabela 2.2): lista słownika, dodanie i zmiana organizacji. Właściciel: u22.
// Wzory: cz2/Podmioty-wsparcia, cz2/P18-17 do P18-22. Konto bez roli Administrator widzi 0047 bez danych panelu.
import { use } from 'react';
import { useKonto } from '@/dane/magazyn/hooki';
import { BrakUprawnien } from '@/komponenty/brak-uprawnien';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { FormularzPodmiotuWsparcia } from './_czesci/formularz';
import { ListaPodmiotowWsparcia } from './_czesci/lista';

function Edycja({ params }: { params: PageProps<'/panel/podmioty-wsparcia/[idOrganizacji]'>['params'] }) {
  const { idOrganizacji } = use(params);
  return <FormularzPodmiotuWsparcia idOrganizacji={decodeURIComponent(idOrganizacji)} />;
}

export function WidokPodmiotowWsparciaWPanelu({
  tryb,
  params,
}: {
  tryb: TrybWidoku<'ViewCatalogSupportOrganizations'>;
  params?: PageProps<'/panel/podmioty-wsparcia/[idOrganizacji]'>['params'];
}) {
  const konto = useKonto();
  if (konto?.rola !== 'administrator') return <BrakUprawnien obszar="podmioty-wsparcia" />;
  if (tryb === 'lista') return <ListaPodmiotowWsparcia />;
  if (tryb === 'edycja' && params) return <Edycja params={params} />;
  return <FormularzPodmiotuWsparcia />;
}
