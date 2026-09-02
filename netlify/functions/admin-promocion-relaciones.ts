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

        const administrador =
            obtenerAdministrador(event);

        if (!administrador) {
            return {
                statusCode: 401,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "No autorizado"
                })
            };
        }

        if (event.httpMethod !== "GET") {
            return {
                statusCode: 405,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "Método no permitido"
                })
            };
        }

        const id = Number(
            event.queryStringParameters?.['id']
        );

        if (!Number.isInteger(id) || id <= 0) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    error: "ID de promoción inválido"
                })
            };
        }

        const categoriasResult = await pool.query(
            `
      SELECT categorias_id
      FROM promocion_categoria
      WHERE promociones_id = $1
      ORDER BY categorias_id ASC;
      `,
            [id]
        );

        const productosResult = await pool.query(
            `
      SELECT productos_id
      FROM promocion_producto
      WHERE promociones_id = $1
      ORDER BY productos_id ASC;
      `,
            [id]
        );

        return {
            statusCode: 200,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                categorias:
                    categoriasResult.rows.map(
                        fila => Number(fila.categorias_id)
                    ),

                productos:
                    productosResult.rows.map(
                        fila => Number(fila.productos_id)
                    )
            })
        };

    } catch (error) {

        console.error(
            "Error obteniendo relaciones de promoción:",
            error
        );

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                error: "Error interno del servidor"
            })
        };

    }

};