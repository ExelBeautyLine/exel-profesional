import { Handler } from '@netlify/functions';
import { pool } from './lib/db';

export const handler: Handler = async (event) => {

  const slug = event.queryStringParameters?.['slug'];

  if (!slug) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Falta el parámetro slug"
      })
    };
  }

  try {

    const result = await pool.query(
      `
      SELECT p.*
      FROM productos p
      INNER JOIN producto_subcategoria ps
          ON ps.producto_id = p.id
      INNER JOIN subcategorias s
          ON s.id = ps.subcategoria_id
      WHERE s.slug = $1
      ORDER BY p.nombre
      `,
      [slug]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };

  } catch (error) {

    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };

  }

};