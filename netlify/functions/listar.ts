import { Handler } from '@netlify/functions';
import { pool } from './lib/db';
import { calcularPrecio } from './lib/precio';
import { obtenerConfiguracionPrecios } from './lib/configuracion-precios';

export const handler: Handler = async () => {

  try {

    const configuracion = await obtenerConfiguracionPrecios();

    const result = await pool.query(`
      SELECT *
      FROM productos
      LIMIT 10
    `);

    const productos = result.rows;
    for (const producto of productos) {
      producto.precio = await calcularPrecio(producto,configuracion);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(productos)
    };

  } catch (error) {

    console.error('ERROR POSTGRES:', error);

    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };


  }

};