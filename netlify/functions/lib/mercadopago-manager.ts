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

            ]

        }

    });

}