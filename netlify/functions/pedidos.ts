import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {

    const body = JSON.parse(event.body ?? "{}");

    console.log("Pedido recibido:");

    console.dir(body, { depth: null });

    return {

        statusCode: 200,

        body: JSON.stringify({

            ok: true

        })

    };

};