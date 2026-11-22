import type { Metadata } from 'next';
import { TrescNieZnaleziono } from '@/komponenty/rama/tresc-nie-znaleziono';
import { teksty } from '@/teksty';

export const metadata: Metadata = { title: teksty.rama.nieZnaleziono.tytulStrony };

// notFound() w symulacjach eZUS i kanałów: treść w układzie symulacji, który ma już nagłówek, link
// „Przejdź do treści” i element main.
export default function NieZnalezionoWSymulacji() {
  return <TrescNieZnaleziono />;
}
