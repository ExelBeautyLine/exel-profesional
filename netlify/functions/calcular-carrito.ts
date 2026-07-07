import { Handler } from "@netlify/functions";
import { calcularResumen,ItemCarrito } from "./lib/calcular-resumen";


export const handler: Handler = async (event) => {

    const items: ItemCarrito[] = JSON.parse(
        event.body ?? "[]"
    );

    const resumen = await calcularResumen(items, 0);


    return {

        statusCode: 200,

        body: JSON.stringify(resumen)


    };

};