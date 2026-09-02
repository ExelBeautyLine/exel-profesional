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

    const categoriasResult = await pool.query(`
      SELECT
        c.id,
        c.nombre,
        c.activo,
        COUNT(DISTINCT p.id)::integer AS cantidad_productos
      FROM categorias c
      LEFT JOIN subcategorias s
        ON s.categorias_id = c.id
      LEFT JOIN productos p
        ON p.subcategorias_id = s.id
        AND p.activo = TRUE
      WHERE c.activo = TRUE
      GROUP BY
        c.id,
        c.nombre,
        c.activo
      ORDER BY c.nombre ASC;
    `);

    const productosResult = await pool.query(`
      SELECT
        p.id,
        p.codigo,
        p.nombre,
        p.activo,
        p.stock,
        c.id AS categoria_id,
        c.nombre AS categoria_nombre
      FROM productos p
      INNER JOIN subcategorias s
        ON s.id = p.subcategorias_id
      INNER JOIN categorias c
        ON c.id = s.categorias_id
      WHERE
        p.activo = TRUE
        AND c.activo = TRUE
      ORDER BY p.nombre ASC;
    `);

    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        categorias: categoriasResult.rows,
        productos: productosResult.rows
      })
    };

  } catch (error) {

    console.error(
      "Error obteniendo categorías y productos:",
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