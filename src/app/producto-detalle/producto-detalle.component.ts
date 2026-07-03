import { Component,OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { ProductosService } from '../services/productos-services';
import { Producto } from '../productos-listar/Producto';


@Component({
  selector: 'app-producto-detalle',
  standalone: false,
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.scss'
})
export class ProductoDetalleComponent implements OnInit {

  producto!: Producto;
  imagenes: string[] = [];
  imagenSeleccionada = '';

  constructor(
    private productosDataService: ProductosService,
    private route: ActivatedRoute,
    private router: Router) 
  {}

  ngOnInit(): void {

    

  this.route.paramMap.subscribe(params => {

    const slug = params.get('slug');

    if (!slug) {

      this.router.navigate(['/productos']);
      return;

    }

    this.productosDataService
      .obtenerProducto(slug)
      .subscribe(producto => {

        this.producto = producto;

        this.imagenes = [];

        const cantidadImagenes = this.producto.cantidad_imagenes ?? 2;

        for (let i = 0; i < cantidadImagenes; i++) {

          this.imagenes.push(
            `assets/img/${this.producto.imagen_url}-${i}.jpg`
          );

        }

        this.imagenSeleccionada = this.imagenes[0];

      });

  });

}

}
