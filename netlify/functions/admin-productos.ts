import { Handler } from "@netlify/functions";
import jwt from "jsonwebtoken";
import { pool } from "./lib/db";

function obtenerAdministrador(event: Parameters<Handler>[0]) {

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
        throw new Error("ADMIN_JWT_SECRET no está configurada");
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
        p.id,
        p.codigo,
        p.nombre,
        p.precio_base,
        p.stock,
        p.destacado,
        p.activo,
        p.imagen_url,
        c.id AS categoria_id,
        c.nombre AS categoria_nombre,
        s.id AS subcategoria_id,
        s.nombre AS subcategoria_nombre
    FROM productos p
    LEFT JOIN subcategorias s
        ON s.id = p.subcategorias_id
    LEFT JOIN categorias c
        ON c.id = s.categorias_id
    ORDER BY p.nombre;
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
            "Error obteniendo productos:",
            error
        );

        return {
            statusCode: 401,
            body: JSON.stringify({
                error: "No autorizado"
            })
        };

    }

};
