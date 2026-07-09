import { pool } from "./db";
import { calcularResumen, ItemCarrito } from "./calcular-resumen";
import { PoolClient } from "pg";

export interface CrearPedidoRequest {

    items: ItemCarrito[];

    cliente: {

        nombre: string;

        apellido: string;

        email: string;

        telefono: string;

    };

    direccion: {

        provincia: string;

        localidad: string;

        codigoPostal: string;

        calle: string;

        numero: string;

        piso?: string;

        departamento?: string;

        observaciones?: string;

    };

    entrega: 'retiro' | 'envio';

    pago: 'transferencia' | 'tarjeta';

}
async function crearCliente(

    client: PoolClient,

    cliente: CrearPedidoRequest["cliente"]

): Promise<number> {

    const result = await client.query(

        `INSERT INTO clientes (

            nombre,
            apellido,
            email,
            telefono

        )

        VALUES ($1,$2,$3,$4)

        RETURNING id`,

        [

            cliente.nombre,

            cliente.apellido,

            cliente.email,

            cliente.telefono

        ]

    );

    return result.rows[0].id;

}

async function crearDireccion(

    client: PoolClient,

    clienteId: number,

    direccion: CrearPedidoRequest["direccion"]

): Promise<number> {

    const result = await client.query(

        `INSERT INTO direcciones (

            cliente_id,

            provincia,

            ciudad,

            codigo_postal,

            direccion,

            numero,

            piso,

            departamento,

            observaciones

        )

        VALUES (

            $1,$2,$3,$4,$5,$6,$7,$8,$9

        )

        RETURNING id`,

        [

            clienteId,

            direccion.provincia,

            direccion.localidad,

            direccion.codigoPostal,

            direccion.calle,

            direccion.numero,

            direccion.piso || null,

            direccion.departamento || null,

            direccion.observaciones || null

        ]

    );

    return result.rows[0].id;

}

async function crearPedidoDB(

    client: PoolClient,

    clienteId: number,

    direccionId: number | null,

    body: CrearPedidoRequest,

    resumen: Awaited<ReturnType<typeof calcularResumen>>

): Promise<number> {

    const tipoPrecioId =
        body.pago === "transferencia"
            ? 1
            : 4;

    const subtotal =
        body.pago === "transferencia"
            ? resumen.subtotalTransferencia
            : resumen.subtotalTarjeta;

    const total =
        body.pago === "transferencia"
            ? resumen.totalTransferencia
            : resumen.totalTarjeta;

    const result = await client.query(

        `INSERT INTO pedidos (

            cliente_id,

            direccion_id,

            estado_id,

            subtotal,

            descuento,

            costo_envio,

            total,

            tipo_precio_id,

            cantidad_cuotas

        )

        VALUES (

            $1,$2,$3,$4,$5,$6,$7,$8,$9

        )

        RETURNING id`,

        [

            clienteId,

            direccionId,

            1,

            subtotal,

            0,

            resumen.costoEnvio,

            total,

            tipoPrecioId,

            null

        ]

    );

    return result.rows[0].id;

}

async function crearDetallePedido(

    client: PoolClient,

    pedidoId: number,

    resumen: Awaited<ReturnType<typeof calcularResumen>>,

    pago: "transferencia" | "tarjeta"


): Promise<void> {

    for (const item of resumen.items) {

        const subtotal =

            pago === "transferencia"

                ? item.subtotalTransferencia

                : item.subtotalTarjeta;

        const precioUnitario =

            item.cantidad > 0

                ? subtotal / item.cantidad

                : 0;

        await client.query(

            `INSERT INTO detalle_pedido (

                pedido_id,

                producto_id,

                cantidad,

                precio_unitario,

                subtotal

            )

            VALUES (

                $1,$2,$3,$4,$5

            )`,

            [

                pedidoId,

                item.producto.id,

                item.cantidad,

                precioUnitario,

                subtotal

            ]

        );

    }

}

async function actualizarStock(

    client: PoolClient,

    resumen: Awaited<ReturnType<typeof calcularResumen>>

): Promise<void> {

    for (const item of resumen.items) {

        await client.query(

            `UPDATE productos

             SET stock = stock - $1

             WHERE id = $2
             AND stock >= $1`,

            [

                item.cantidad,

                item.producto.id

            ]

        );

    }

}


export async function crearPedido(
    body: CrearPedidoRequest
) {

    console.log("Crear pedido:", body);
    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const costoEnvio =
            body.entrega === "envio"
                ? 9408
                : 0;

        const resumen = await calcularResumen(
            body.items,
            costoEnvio
        );

        console.log(resumen);

        const clienteId = await crearCliente(

            client,

            body.cliente

        );

        console.log("Cliente:", clienteId);
        let direccionId: number | null = null;

        if (body.entrega === "envio") {

            direccionId = await crearDireccion(

                client,

                clienteId,

                body.direccion

            );

        }

        console.log("Dirección:", direccionId);

        const pedidoId = await crearPedidoDB(

            client,

            clienteId,

            direccionId,

            body,

            resumen

        );

        console.log("Pedido:", pedidoId);

        await crearDetallePedido(

            client,

            pedidoId,

            resumen,
            
            body.pago

        );

        await actualizarStock(

            client,

            resumen

        );
        await client.query("COMMIT");

        return {

            pedidoId,

            total:

                body.pago === "transferencia"

                    ? resumen.totalTransferencia

                    : resumen.totalTarjeta,

            pago: body.pago,

            entrega: body.entrega

        };

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

}