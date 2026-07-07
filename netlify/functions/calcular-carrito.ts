import { Handler } from "@netlify/functions";
import { pool } from "./lib/db";

import { calcularPrecio } from "./lib/precio";
import { obtenerConfiguracionPrecios } from "./lib/configuracion-precios";

interface ItemCarrito {

    productoId: number;

    cantidad: number;

}

interface ItemCarritoDetalle {

    producto: any;

    cantidad: number;

    subtotalTarjeta: number;

    subtotalTransferencia: number;

}

interface RespuestaCarrito {

    items: ItemCarritoDetalle[];

    subtotalTarjeta: number;

    subtotalTransferencia: number;

    cantidadItems: number;

}


export const handler: Handler = async (event) => {

    const items: ItemCarrito[] = JSON.parse(event.body ?? "[]");

    console.log("Items recibidos:", items);
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

        return {

            producto,

            cantidad: item.cantidad,

            subtotalTarjeta:
                producto.precio.tarjeta * item.cantidad,

            subtotalTransferencia:
                producto.precio.transferencia * item.cantidad

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

    return {

        statusCode: 200,

        body: JSON.stringify({

            items: carrito,

            subtotalTarjeta,

            subtotalTransferencia,

            cantidadItems

        })


    };

};