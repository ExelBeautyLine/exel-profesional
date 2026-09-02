import { Handler } from "@netlify/functions";
import jwt from "jsonwebtoken";
import { pool } from "./lib/db";

function obtenerAdministrador(
    event: Parameters<Handler>[0]
) {

    const cookies = event.headers["cookie"] || "";

    const match = cookies.match(
        /(?:^|;\s*)admin_token=([^;]+)/
    );

    if (!match) {
        return null;
    }

    const token = match[1];

    const secret = process.env["ADMIN_JWT_SECRET"];

    if (!secret) {
        throw new Error(
            "ADMIN_JWT_SECRET no está configurada"
        );
    }

    return jwt.verify(token, secret);
}

export const handler: Handler = async (event) => {

    try {

        const administrador = obtenerAdministrador(event);

        if (!administrador) {

            return {
                statusCode: 401,
                body: JSON.stringify({
                    error: "No autorizado"
                })
            };

        }

        if (event.httpMethod !== "GET") {

            return {
                statusCode: 405,
                body: JSON.stringify({
                    error: "Método no permitido"
                })
            };

        }

        const result = await pool.query(`
      SELECT
        id,
        nombre,
        descripcion,
        porcentaje_descuento,
        fecha_inicio,
        fecha_fin,
        activo,
        acumulable
      FROM promociones
      ORDER BY fecha_inicio DESC, id DESC;
    `);

        return {

            statusCode: 200,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(result.rows)

        };

    } catch (error) {

        console.error(
            "Error obteniendo promociones:",
            error
        );

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Error interno del servidor"
            })
        };

    }

};