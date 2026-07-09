import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {

    console.log("Webhook recibido");

    console.log(event.body);

    return {

        statusCode: 200,

        body: "OK"

    };

};