import { Component, OnInit } from '@angular/core';

import { CarritoApiService } from './carrito-api-service';

import { CarritoService } from './carrito.service';
import {
    ItemCarritoDetalle,
    RespuestaCarrito
} from './carrito-response.model';

@Component({
    selector: 'app-carrito',
    standalone: false,
    templateUrl: './carrito.component.html',
    styleUrl: './carrito.component.scss'
})
export class CarritoComponent implements OnInit {

    carrito!: RespuestaCarrito;

    cargando = true;

    constructor(

        private carritoApiService: CarritoApiService,
        private carritoService: CarritoService

    ) { }

    ngOnInit(): void {

        this.cargarCarrito();


    }

    cargarCarrito(): void {

        this.carritoApiService
            .obtenerCarrito()
            .subscribe({

                next: (respuesta) => {

                    this.carrito = respuesta;

                    this.cargando = false;

                },

                error: (error) => {

                    console.error(error);

                    this.cargando = false;

                }

            });
    }

    aumentar(item: ItemCarritoDetalle): void {

         if (item.cantidad >= item.producto.stock) {

            alert(`Solo hay ${item.producto.stock} unidades disponibles.`);

            return;

        }

        this.carritoService.actualizarCantidad(

            item.producto.id,

            item.cantidad + 1

        );

        this.cargarCarrito();

    }

    disminuir(item: ItemCarritoDetalle): void {

        this.carritoService.actualizarCantidad(

            item.producto.id,

            item.cantidad - 1

        );

        this.cargarCarrito();

    }
   
    eliminar(item: ItemCarritoDetalle): void {

        this.carritoService.eliminarProducto(item.producto.id);

        this.cargarCarrito();

    }

    vaciarCarrito(): void {

        this.carritoService.vaciarCarrito();

        this.cargarCarrito();

    }
    
    continuarCompra(): void {

        console.log("Ir al checkout");

    }
    
    obtenerPorcentajeEnvioGratis(): number {

        if (!this.carrito) {
            return 0;
        }

        return Math.min(
            (this.carrito.subtotalTransferencia / 120000) * 100,
            100
        );

    }
}