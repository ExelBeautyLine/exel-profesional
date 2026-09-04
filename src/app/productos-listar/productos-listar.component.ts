import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { Producto } from './Producto';
import { ProductosService } from '../services/productos-services';
import { CarritoService } from '../carrito/carrito.service';
import { CarritoApiService } from '../carrito/carrito-api-service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Component({
  selector: 'app-productos-listar',
  standalone: false,
  templateUrl: './productos-listar.component.html',
  styleUrl: './productos-listar.component.scss'
})
export class ProductosListaComponent implements OnInit {

  productos: Producto[] = [];
  busqueda = '';

  hoverProducto: number | null = null;

  constructor(
    private productosDataService: ProductosService,
    private route: ActivatedRoute,
    private carritoService: CarritoService,
    private carritoApiService: CarritoApiService,
    private notificaciones: NotificacionesService
  ) { }

  ngOnInit(): void {

    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, queryParams]) => {

      const slug = params.get('slug');
      this.busqueda = queryParams.get('buscar')?.trim() ?? '';
      const esCategoria =
        this.route.snapshot.routeConfig?.path ===
        'productos/categoria/:slug';

      if (this.busqueda) {
        this.productosDataService
          .buscarPorNombre(this.busqueda)
          .subscribe(productos => this.productos = productos);

        return;
      }


      if (slug) {

        const productos$ = esCategoria
          ? this.productosDataService.listarPorCategoria(slug)
          : this.productosDataService.listarPorSubcategoria(slug);

        productos$.subscribe(productos => this.productos = productos);

      } else {

        this.productosDataService
          .listar()
          .subscribe(productos => this.productos = productos);

      }

    });


  }

  comprar(producto: Producto): void {

    const cantidadEnCarrito = this.carritoService.obtenerCantidad(producto.id);

    if (cantidadEnCarrito >= producto.stock) {

      this.notificaciones.mostrar(
        `Solo hay ${producto.stock} unidades disponibles.`,
        'advertencia'
      );

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
