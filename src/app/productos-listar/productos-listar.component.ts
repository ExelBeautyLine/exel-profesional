import { Component, OnInit } from '@angular/core';
import { Producto} from './Producto';
import { ProductosService } from '../services/productos-services';


@Component({
  selector: 'app-productos-listar',
  standalone: false,
  templateUrl: './productos-listar.component.html',
  styleUrl: './productos-listar.component.scss'
})
export class ProductosListaComponent implements OnInit{

    productos: Producto[] = [];

    constructor(
      private productosDataService: ProductosService){
    }
    
    ngOnInit() : void{
      this.productosDataService.listar()
      .subscribe( productos => this.productos = productos)
    }
    
    hoverProducto: number | null = null;
}
