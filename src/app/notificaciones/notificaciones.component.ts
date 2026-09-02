import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NotificacionesService } from './notificaciones.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.scss'
})
export class NotificacionesComponent {
  constructor(public notificaciones: NotificacionesService) {}
}
