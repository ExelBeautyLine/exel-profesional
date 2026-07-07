import { Handler } from '@netlify/functions';
import { pool } from './lib/db';
import { calcularPrecio } from './lib/precio';
import { obtenerConfiguracionPrecios } from './lib/configuracion-precios';

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

    const configuracion = await obtenerConfiguracionPrecios();


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

    const productos = result.rows;
        
    for (const producto of productos) {
        producto.precio = await calcularPrecio(producto,configuracion);
       
    }
    
    

    return {
      statusCode: 200,
      body: JSON.stringify(productos)
    };

  } catch (error) {

    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };

  }

};