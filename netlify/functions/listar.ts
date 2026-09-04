import { Handler } from '@netlify/functions';
import { pool } from './lib/db';
import { calcularPrecio } from './lib/precio';
import { obtenerConfiguracionPrecios } from './lib/configuracion-precios';

export const handler: Handler = async (event) => {

  try {

    const busqueda = event.queryStringParameters?.['buscar']?.trim() ?? '';
    const configuracion =
      await obtenerConfiguracionPrecios();

    const result = busqueda
      ? await pool.query(
          `
            SELECT p.*
            FROM productos p
            WHERE
              translate(lower(coalesce(p.nombre, '')), 'áéíóúüñ', 'aeiouun') LIKE $1
              OR lower(coalesce(p.codigo, '')) LIKE lower($2)
            ORDER BY p.nombre
          `,
          [
            `%${busqueda.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}%`,
            `%${busqueda}%`
          ]
        )
      : await pool.query(`
          SELECT *
          FROM productos
          LIMIT 8
        `);

    const productos = await Promise.all(
      result.rows.map(async (producto) => {

        const precio = await calcularPrecio(
          producto,
          configuracion
        );

        return {
          ...producto,
          precio
        };

      })
    );

    return {
      statusCode: 200,

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(productos)
    };

  } catch (error) {

    console.error(
      'ERROR POSTGRES:',
      error
    );

    return {
      statusCode: 500,

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        error: 'No se pudieron cargar los productos'
      })
    };

  }

};
