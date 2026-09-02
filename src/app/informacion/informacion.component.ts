import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type SeccionInformacion = 'quienes-somos' | 'como-comprar' | 'cambios-y-devoluciones';

@Component({
  selector: 'app-informacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './informacion.component.html',
  styleUrl: './informacion.component.scss'
})
export class InformacionComponent implements OnInit {
  seccion: SeccionInformacion = 'quienes-somos';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const seccion = params.get('seccion');

      if (seccion === 'como-comprar' || seccion === 'cambios-y-devoluciones' || seccion === 'quienes-somos') {
        this.seccion = seccion;
      }
    });
  }
}
