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
      INNER JOIN subcategorias s
        ON p.subcategorias_id = s.id
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