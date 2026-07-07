import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Producto } from './Producto';
import { ProductosService } from '../services/productos-services';
import { CarritoService } from '../carrito/carrito.service';
import { CarritoApiService } from '../carrito/carrito-api-service';

@Component({
  selector: 'app-productos-listar',
  standalone: false,
  templateUrl: './productos-listar.component.html',
  styleUrl: './productos-listar.component.scss'
})
export class ProductosListaComponent implements OnInit {

  productos: Producto[] = [];

  hoverProducto: number | null = null;

  constructor(
    private productosDataService: ProductosService,
    private route: ActivatedRoute,
    private carritoService: CarritoService,
    private carritoApiService: CarritoApiService
  ) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const slug = params.get('slug');

      console.log("SLUG:", slug);


      if (slug) {

        this.productosDataService
          .listarPorSubcategoria(slug)
          .subscribe(productos => {
            this.productos = productos;
          });

      } else {

        this.productosDataService
          .listar()
          .subscribe(productos => {
            this.productos = productos;
          });

      }

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