import { Handler } from "@netlify/functions";
import { Payment } from "mercadopago";
import { mercadoPago } from "./lib/mercadopago-manager";
import { pool } from "./lib/db";

export const handler: Handler = async (event) => {

    console.log("Webhook recibido");
    console.log("Body:", event.body);

    try {

        const body = JSON.parse(event.body ?? "{}");

        const paymentId =
            body?.data?.id ??
            body?.id ??
            body?.resource;

        if (!paymentId) {

            console.log("No se recibió payment_id");

            return {
                statusCode: 200,
                body: "OK"
            };

        }

        console.log("Payment ID:", paymentId);

        const paymentClient = new Payment(mercadoPago);

        const payment = await paymentClient.get({
            id: paymentId.toString()
        });

        console.log("Pago consultado:", {
            id: payment.id,
            status: payment.status,
            external_reference: payment.external_reference
        });

        const pedidoId = payment.external_reference;

        if (!pedidoId) {

            console.log("El pago no tiene external_reference");

            return {
                statusCode: 200,
                body: "OK"
            };

        }

        let estadoId: number | null = null;

        switch (payment.status) {

            case "approved":
                estadoId = 2;
                break;

            case "cancelled":
            case "rejected":
                estadoId = 6;
                break;

            case "pending":
            case "in_process":
            case "in_mediation":
                estadoId = 1;
                break;

            default:
                console.log(
                    "Estado de Mercado Pago no manejado:",
                    payment.status
                );
                break;
        }

        if (estadoId !== null) {

            await pool.query(
                `
                UPDATE pedidos
                SET
                    estado_id = $1,
                    referencia_pago = $2
                WHERE id = $3
                `,
                [
                    estadoId,
                    payment.id?.toString() ?? null,
                    Number(pedidoId)
                ]
            );

            console.log(
                `Pedido ${pedidoId} actualizado. Estado: ${estadoId}`
            );

        }

        return {

            statusCode: 200,

            body: "OK"

        };

    } catch (error) {

        console.error("Error procesando webhook:", error);

        return {

            statusCode: 500,

            body: "Error"

        };

    }

};