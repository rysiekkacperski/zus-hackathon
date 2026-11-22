// GET /api/v1/openapi.json: opis REST API w wersji 1 w formacie OpenAPI 3.1, złożony z rejestru punktów końcowych.
// Odpowiedź nie zależy od żądania, więc przy Cache Components powstaje z góry podczas budowania aplikacji.
import { dokumentOpenApi } from '@/serwer/api/openapi';

export function GET(): Response {
  return Response.json(dokumentOpenApi());
}
