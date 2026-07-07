export interface Cuota {

    cantidad: number;

    precioTotal: number;

    valorCuota: number;

}

export interface ItemCheckout {

    producto: any;

    cantidad: number;

    subtotalTarjeta: number;

    subtotalTransferencia: number;

    sinStock: boolean;

}

export interface RespuestaCheckout {

    items: ItemCheckout[];

    subtotalTarjeta: number;

    subtotalTransferencia: number;

    cantidadItems: number;

    costoEnvio: number;

    totalTarjeta: number;

    totalTransferencia: number;

    cuotas?: Cuota[];

}