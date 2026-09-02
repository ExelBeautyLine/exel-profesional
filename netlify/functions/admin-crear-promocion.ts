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

    if (event.httpMethod !== "POST") {

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

    let body: any;

    try {

      body = JSON.parse(
        event.body || "{}"
      );

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

    const nombre =
      String(body.nombre || "").trim();

    const descripcion =
      body.descripcion
        ? String(body.descripcion).trim()
        : null;

    const porcentajeDescuento =
      Number(body.porcentajeDescuento);

    const fechaInicio =
      String(body.fechaInicio || "");

    const fechaFin =
      String(body.fechaFin || "");

    const activo =
      body.activo !== false;

    const acumulable =
      body.acumulable !== false;


    // =========================
    // CATEGORÍAS
    // =========================

    const categorias =
      Array.isArray(body.categorias)
        ? body.categorias
            .map(Number)
            .filter(
              (id: number) =>
                Number.isInteger(id) &&
                id > 0
            )
        : [];


    // =========================
    // PRODUCTOS
    // =========================

    const productos =
      Array.isArray(body.productos)
        ? body.productos
            .map(Number)
            .filter(
              (id: number) =>
                Number.isInteger(id) &&
                id > 0
            )
        : [];


    // =========================
    // VALIDACIONES
    // =========================

    if (!nombre) {

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "El nombre es obligatorio"
        })
      };

    }

    if (
      !Number.isFinite(porcentajeDescuento) ||
      porcentajeDescuento < 0 ||
      porcentajeDescuento > 100
    ) {

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error:
            "El porcentaje de descuento debe estar entre 0 y 100"
        })
      };

    }

    if (!fechaInicio || !fechaFin) {

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Las fechas son obligatorias"
        })
      };

    }

    if (fechaInicio > fechaFin) {

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error:
            "La fecha de inicio no puede ser posterior a la fecha de fin"
        })
      };

    }

    if (
      categorias.length === 0 &&
      productos.length === 0
    ) {

      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error:
            "Seleccioná al menos una categoría o un producto"
        })
      };

    }


    // =========================
    // CONEXIÓN
    // =========================

    client = await pool.connect();

    await client.query("BEGIN");


    // =========================
    // CREAR PROMOCIÓN
    // =========================

    const result = await client.query(
      `
      INSERT INTO promociones (
        nombre,
        descripcion,
        porcentaje_descuento,
        fecha_inicio,
        fecha_fin,
        activo,
        acumulable
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        nombre,
        descripcion,
        porcentaje_descuento,
        fecha_inicio,
        fecha_fin,
        activo,
        acumulable;
      `,
      [
        nombre,
        descripcion,
        porcentajeDescuento,
        fechaInicio,
        fechaFin,
        activo,
        acumulable
      ]
    );


    const promocion =
      result.rows[0];


    // =========================
    // CATEGORÍAS
    // =========================

    for (const categoriaId of categorias) {

      await client.query(
        `
        INSERT INTO promocion_categoria (
          promociones_id,
          categorias_id
        )
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
        `,
        [
          promocion.id,
          categoriaId
        ]
      );

    }


    // =========================
    // PRODUCTOS
    // =========================

    for (const productoId of productos) {

      await client.query(
        `
        INSERT INTO promocion_producto (
          promociones_id,
          productos_id
        )
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
        `,
        [
          promocion.id,
          productoId
        ]
      );

    }


    // =========================
    // CONFIRMAR
    // =========================

    await client.query("COMMIT");


    return {

      statusCode: 201,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        mensaje:
          "Promoción creada correctamente",

        promocion,

        categorias,
        productos

      })

    };

  } catch (error) {

    console.error(
      "Error creando promoción:",
      error
    );


    if (client) {

      try {

        await client.query(
          "ROLLBACK"
        );

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
        error:
          "Error interno del servidor"
      })

    };

  } finally {

    if (client) {
      client.release();
    }

  }

};