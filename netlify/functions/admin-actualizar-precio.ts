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
        body: JSON.stringify({
          error: "No autorizado"
        })
      };

    }

    if (event.httpMethod !== "PUT") {

      return {
        statusCode: 405,
        body: JSON.stringify({
          error: "Método no permitido"
        })
      };

    }

    const body = JSON.parse(
      event.body || "{}"
    );

    const productoId =
      Number(body.productoId);

    const precioBase =
      Number(body.precioBase);

    const stock =
      Number(body.stock);

    const destacado =
      body.destacado === true;

    const activo =
      body.activo !== false;


    /*
     * Validar producto
     */

    if (
      !Number.isInteger(productoId) ||
      productoId <= 0
    ) {

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Producto inválido"
        })
      };

    }


    /*
     * Validar precio
     */

    if (
      !Number.isFinite(precioBase) ||
      precioBase < 0
    ) {

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Precio inválido"
        })
      };

    }


    /*
     * Validar stock
     */

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "El stock debe ser un número entero mayor o igual a 0"
        })
      };

    }


    /*
     * Actualizar producto
     */

    const result = await pool.query(
      `
      UPDATE productos
      SET
        precio_base = $1,
        stock = $2,
        destacado = $3,
        activo = $4
      WHERE id = $5
      RETURNING
        id,
        codigo,
        nombre,
        precio_base,
        stock,
        destacado,
        activo;
      `,
      [
        precioBase,
        stock,
        destacado,
        activo,
        productoId
      ]
    );


    /*
     * Producto inexistente
     */

    if (result.rows.length === 0) {

      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Producto no encontrado"
        })
      };

    }


    return {

      statusCode: 200,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        mensaje: "Producto actualizado correctamente",
        producto: result.rows[0]
      })

    };

  } catch (error) {

    console.error(
      "Error actualizando producto:",
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