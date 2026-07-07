import { Handler } from "@netlify/functions";

import {
    calcularResumen,
    ItemCarrito
} from "./lib/calcular-resumen";

export const handler: Handler = async (event) => {

    const body = JSON.parse(event.body ?? "{}");

    const items: ItemCarrito[] = body.items ?? [];

    const entrega = body.entrega ?? "retiro";

    const costoEnvio = entrega === "envio"
        ? 9408
        : 0;

    const resumen = await calcularResumen(
        items,
        costoEnvio
    );

    console.log("Resumen:", resumen);
    console.log("Body:", body);
    console.log("Items:", items);
    console.log("Entrega:", entrega);
    return {

        statusCode: 200,

        body: JSON.stringify(resumen)

    };

};