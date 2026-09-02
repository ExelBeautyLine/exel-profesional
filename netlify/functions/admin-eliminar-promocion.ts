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

  if (event.httpMethod !== "DELETE") {

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

  let client;

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

    if (!event.body) {

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Falta el ID de la promoción"
        })
      };

    }

    let datos: {
      id?: number;
    };

    try {

      datos = JSON.parse(event.body);

    } catch {

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Datos inválidos"
        })
      };

    }

    const id = Number(datos.id);

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

    client = await pool.connect();

    await client.query("BEGIN");

    /*
     * Primero eliminamos las relaciones.
     */

    await client.query(
      `
      DELETE FROM promocion_categoria
      WHERE promociones_id = $1
      `,
      [id]
    );

    await client.query(
      `
      DELETE FROM promocion_producto
      WHERE promociones_id = $1
      `,
      [id]
    );

    /*
     * Después eliminamos la promoción.
     */

    const resultado = await client.query(
      `
      DELETE FROM promociones
      WHERE id = $1
      RETURNING id, nombre
      `,
      [id]
    );

    if (resultado.rowCount === 0) {

      await client.query("ROLLBACK");

      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "La promoción no existe"
        })
      };

    }

    await client.query("COMMIT");

    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        mensaje: "Promoción eliminada correctamente",
        promocion: resultado.rows[0]
      })
    };

  } catch (error) {

    console.error(
      "Error eliminando promoción:",
      error
    );

    if (client) {

      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Error haciendo rollback:",
          rollbackError
        );
      }

    }

    return {
      statusCode: 500,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        error: "No se pudo eliminar la promoción"
      })
    };

  } finally {

    if (client) {
      client.release();
    }

  }

};