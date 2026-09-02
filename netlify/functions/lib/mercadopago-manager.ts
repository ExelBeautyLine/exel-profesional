import { MercadoPagoConfig } from "mercadopago";
import { Preference } from "mercadopago";
import { CrearPedidoRequest } from "./pedidos-manager";
import { calcularResumen } from "./calcular-resumen";

export const mercadoPago = new MercadoPagoConfig({
    accessToken: process.env["MERCADO_PAGO_ACCESS_TOKEN"]!
});

export async function crearPreferencia(
    pedidoId: number,
    body: CrearPedidoRequest,
    resumen: Awaited<ReturnType<typeof calcularResumen>>
) {

    const preference = new Preference(mercadoPago);

    return preference.create({

        body: {

            items: [

                {
                    id: pedidoId.toString(),

                    title: `Pedido #${pedidoId}`,

                    quantity: 1,

                    currency_id: "ARS",

                    unit_price:
                        body.pago === "transferencia"
                            ? resumen.totalTransferencia
                            : resumen.totalTarjeta
                }

            ],

            external_reference: pedidoId.toString(),

            back_urls: {

                success:
                    "https://exelprofessional.netlify.app/gracias",

                failure:
                    "https://exelprofessional.netlify.app/gracias",

                pending:
                    "https://exelprofessional.netlify.app/gracias"

            },

            auto_return: "approved",

            notification_url:
                "https://exelprofessional.netlify.app/.netlify/functions/webhook"

        }

    });

}