import { pool } from "./db";
import { calcularPrecio } from "./precio";
import { obtenerConfiguracionPrecios } from "./configuracion-precios";

export interface ItemCarrito {

    productoId: number;

    cantidad: number;

}

export interface ItemCarritoDetalle {

    producto: any;

    cantidad: number;

    subtotalTarjeta: number;

    subtotalTransferencia: number;

    sinStock: boolean;

}

export interface ResumenCarrito {

    items: ItemCarritoDetalle[];

    subtotalTarjeta: number;

    subtotalTransferencia: number;

    cantidadItems: number;

    costoEnvio: number;

    totalTarjeta: number;

    totalTransferencia: number;

}

export async function calcularResumen(

    items: ItemCarrito[],

    costoEnvio: number

): Promise<ResumenCarrito> {

    const productosId = items.map(
        item => item.productoId
    );

    const productosResult = await pool.query(
        `  SELECT *
                FROM productos
                WHERE id = ANY($1)
            `, [productosId]
    );

    const configuracion = await obtenerConfiguracionPrecios();


    const productos = await Promise.all(

        productosResult.rows.map(async (producto: any) => {

            const precio = await calcularPrecio(
                producto,
                configuracion
            );

            return {

                ...producto,

                precio

            };

        })

    );



    const carrito: ItemCarritoDetalle[] = items.map(item => {

        const producto = productos.find(
            producto => producto.id === item.productoId
        );

        if (!producto) {

            throw new Error(`Producto ${item.productoId} no encontrado`);

        }
        const sinStock = producto.stock <= 0;

        const cantidad = Math.min(item.cantidad, producto.stock);

        return {

            producto,

            cantidad,

            sinStock,

            subtotalTarjeta: sinStock
                ? 0
                : producto.precio.tarjeta * cantidad,

            subtotalTransferencia: sinStock
                ? 0
                : producto.precio.transferencia * cantidad


        };

    });

    const subtotalTarjeta = Number(

        carrito.reduce(

            (total, item) => total + item.subtotalTarjeta,

            0

        ).toFixed(2)

    );

    const subtotalTransferencia = Number(

        carrito.reduce(

            (total, item) => total + item.subtotalTransferencia,

            0

        ).toFixed(2)

    );

    const cantidadItems = carrito.reduce(

        (total, item) => total + item.cantidad,

        0

    );

    const totalTarjeta = subtotalTarjeta + costoEnvio;

    const totalTransferencia = subtotalTransferencia + costoEnvio;

    return {

        items: carrito,

        subtotalTarjeta,

        subtotalTransferencia,

        cantidadItems,

        costoEnvio,

        totalTarjeta,

        totalTransferencia

    };

}