import { Handler } from "@netlify/functions";

import { crearPedido } from "./lib/pedidos-manager";

export const handler: Handler = async (event) => {

    const body = JSON.parse(event.body ?? "{}");

    const pedido = await crearPedido(body);

    console.log("Pedido :", pedido);
    return {

        statusCode: 200,

        body: JSON.stringify(pedido)

    };

};