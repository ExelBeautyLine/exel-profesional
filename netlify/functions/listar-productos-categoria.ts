import { Handler } from '@netlify/functions';
import { pool } from './lib/db';
import { calcularPrecio } from './lib/precio';
import { obtenerConfiguracionPrecios } from './lib/configuracion-precios';

export const handler: Handler = async (event) => {
  const slug = event.queryStringParameters?.['slug'];

  if (!slug) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Falta el parámetro slug' })
    };
  }

  try {
    const configuracion = await obtenerConfiguracionPrecios();
    const resultado = await pool.query(
      `
        SELECT DISTINCT p.*
        FROM productos p
        INNER JOIN producto_subcategoria ps ON ps.producto_id = p.id
        INNER JOIN subcategorias s ON s.id = ps.subcategoria_id
        INNER JOIN categorias c ON c.id = s.categorias_id
        WHERE c.slug = $1 OR CAST(c.id AS TEXT) = $1
        ORDER BY p.nombre
      `,
      [slug]
    );

    const productos = await Promise.all(
      resultado.rows.map(async (producto) => ({
        ...producto,
        precio: await calcularPrecio(producto, configuracion)
      }))
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productos)
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'No se pudieron cargar los productos de la categoría' })
    };
  }
};
