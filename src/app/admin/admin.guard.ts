import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {

  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<{ autenticado: boolean }>(
    '/.netlify/functions/admin-auth',
    {
      withCredentials: true
    }
  ).pipe(

    map(respuesta => {

      if (respuesta.autenticado) {
        return true;
      }

      router.navigate(['/admin/login']);
      return false;

    }),

    catchError(() => {

      router.navigate(['/admin/login']);
      return of(false);

    })

  );

};