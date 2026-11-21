'use client';

import { use } from 'react';
import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { teksty } from '@/teksty';

export function WidokPodmiotowWsparciaWPanelu({ tryb, params }: { tryb: TrybWidoku<'ViewCatalogSupportOrganizations'>; params?: PageProps<'/panel/podmioty-wsparcia/[idOrganizacji]'>['params'] }) {
  const parametry = params ? use(params) : undefined;
  return <EkranZastepczy idWidoku="ViewCatalogSupportOrganizations" jednostka="u22" opis={parametry?.idOrganizacji ?? teksty.ViewCatalogSupportOrganizations.tytulyTrybow[tryb]} />;
}
