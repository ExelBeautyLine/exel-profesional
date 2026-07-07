import { Producto, Cuota } from '../productos-listar/Producto';

export interface ItemCarritoDetalle {

    producto: any;

    cantidad: number;

    subtotalTarjeta: number;

    subtotalTransferencia: number;

    sinStock: boolean;

}

export interface RespuestaCarrito {

    items: ItemCarritoDetalle[];

    subtotalTarjeta: number;

    subtotalTransferencia: number;

    cantidadItems: number;

}