import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Producto } from './Producto';
import { ProductosService } from '../services/productos-services';

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
    private route: ActivatedRoute
  ) {}

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

}