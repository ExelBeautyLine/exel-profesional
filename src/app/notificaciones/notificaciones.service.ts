import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type TipoNotificacion = 'exito' | 'advertencia' | 'error';

export interface Notificacion {
  id: number;
  mensaje: string;
  tipo: TipoNotificacion;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private ultimoId = 0;
  private readonly notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);

  readonly notificaciones$ = this.notificacionesSubject.asObservable();

  mostrar(mensaje: string, tipo: TipoNotificacion = 'exito', duracion = 4200): void {
    const notificacion = { id: ++this.ultimoId, mensaje, tipo };

    this.notificacionesSubject.next([
      ...this.notificacionesSubject.value,
      notificacion
    ]);

    setTimeout(() => this.cerrar(notificacion.id), duracion);
  }

  cerrar(id: number): void {
    this.notificacionesSubject.next(
      this.notificacionesSubject.value.filter((notificacion) => notificacion.id !== id)
    );
  }
}
