import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

import { ProductosService } from '../services/productos-services';
import { Producto } from '../productos-listar/Producto';
import { CarritoService } from '../carrito/carrito.service';
import { CarritoApiService } from '../carrito/carrito-api-service';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {

  @ViewChild('carruselDestacados')
  carruselDestacados?: ElementRef<HTMLElement>;

  productos: Producto[] = [];
  productosDestacados: Producto[] = [];

  cargandoProductos = false;
  cargandoDestacados = false;

  errorProductos = '';
  errorDestacados = '';

  readonly beneficios = [
    {
      icono: '🏅',
      titulo: '15% OFF en transferencia'
    },
    {
      icono: '💳',
      titulo: '3 cuotas sin interés'
    },
    {
      icono: '🚚',
      titulo: 'Envío gratis desde $120.000 ARS'
    }
  ];

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    private carritoApiService: CarritoApiService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarDestacados();
  }

  cargarProductos(): void {

    this.cargandoProductos = true;
    this.errorProductos = '';

    this.productosService.listar().subscribe({

      next: (productos) => {
        this.productos = productos;
        this.cargandoProductos = false;
      },

      error: (error) => {

        console.error(
          'Error cargando productos:',
          error
        );

        this.errorProductos =
          'No se pudieron cargar los productos';

        this.cargandoProductos = false;
      }

    });
  }

  cargarDestacados(): void {

    this.cargandoDestacados = true;
    this.errorDestacados = '';

    this.productosService.listarDestacados().subscribe({

      next: (productos) => {
        this.productosDestacados = productos;
        this.cargandoDestacados = false;
      },

      error: (error) => {

        console.error(
          'Error cargando productos destacados:',
          error
        );

        this.errorDestacados =
          'No se pudieron cargar los productos destacados';

        this.cargandoDestacados = false;
      }

    });
  }

 moverCarrusel(
  carrusel: HTMLElement | undefined,
  direccion: number
): void {

  if (!carrusel) {
    return;
  }

  carrusel.scrollBy({
    left: carrusel.clientWidth * 0.85 * direccion,
    behavior: 'smooth'
  });
}

 comprar(producto: Producto): void {

    const cantidadEnCarrito = this.carritoService.obtenerCantidad(producto.id);

    if (cantidadEnCarrito >= producto.stock) {

      alert(`Solo hay ${producto.stock} unidades disponibles.`);

      return;

    }

    this.carritoService.agregarProducto(producto.id, 1);

    this.carritoApiService
      .obtenerCarrito()
      .subscribe({

        next: (respuesta) => {

          console.log("Respuesta backend:", respuesta);

        },

        error: (error) => {

          console.error(error);

        }

      });

  }


}