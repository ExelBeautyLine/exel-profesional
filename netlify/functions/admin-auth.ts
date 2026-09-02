import { Handler } from "@netlify/functions";
import jwt from "jsonwebtoken";

export const handler: Handler = async (event) => {

    try {

        const cookies = event.headers["cookie"] || "";

        const match = cookies.match(
            /(?:^|;\s*)admin_token=([^;]+)/
        );

        if (!match) {

            return {
                statusCode: 401,
                body: JSON.stringify({
                    autenticado: false
                })
            };

        }

        const token = match[1];

        const secret = process.env["ADMIN_JWT_SECRET"];

        if (!secret) {

            throw new Error(
                "ADMIN_JWT_SECRET no está configurada"
            );

        }

        const payload = jwt.verify(token, secret);

        return {
            statusCode: 200,
            body: JSON.stringify({
                autenticado: true,
                administrador: payload
            })
        };

    } catch (error) {

        console.error("Error verificando sesión:", error);

        return {
            statusCode: 401,
            body: JSON.stringify({
                autenticado: false
            })
        };

    }

};