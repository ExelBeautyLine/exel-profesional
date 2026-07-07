import { Producto, Cuota } from '../productos-listar/Producto';

export interface ItemCarritoDetalle {

    producto: Producto;

    cantidad: number;

    subtotalTarjeta: number;

    subtotalTransferencia: number;

}

export interface RespuestaCarrito {

    items: ItemCarritoDetalle[];

    subtotalTarjeta: number;

    subtotalTransferencia: number;

    cantidadItems: number;

}