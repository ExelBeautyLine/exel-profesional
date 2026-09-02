import { Handler } from '@netlify/functions';
import { pool } from './lib/db';
import { calcularPrecio } from './lib/precio';
import { obtenerConfiguracionPrecios } from './lib/configuracion-precios';

export const handler: Handler = async () => {

  try {

    const configuracion =
      await obtenerConfiguracionPrecios();

    const result = await pool.query(`
      SELECT *
      FROM productos
      WHERE destacado = TRUE
        AND activo = TRUE
      ORDER BY id DESC;
    `);

    const productos = result.rows;

    for (const producto of productos) {

      producto.precio =
        await calcularPrecio(
          producto,
          configuracion
        );

    }

    return {
      statusCode: 200,

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(productos)
    };

  } catch (error) {

    console.error(
      'ERROR OBTENIENDO DESTACADOS:',
      error
    );

    return {
      statusCode: 500,

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        error:
          'No se pudieron obtener los productos destacados'
      })
    };

  }

};