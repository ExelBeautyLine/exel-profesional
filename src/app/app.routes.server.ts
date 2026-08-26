import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // La app consume las Netlify Functions y `localStorage` desde el navegador.
    // Evitamos ejecutar esos flujos en la Edge Function durante SSR.
    renderMode: RenderMode.Client
  }
];
