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


    const result = await pool.query(`
      SELECT
        p.*,
        EXISTS (
          SELECT 1
          FROM producto_subcategoria ps
          INNER JOIN subcategorias s ON s.id = ps.subcategoria_id
          INNER JOIN categorias c ON c.id = s.categorias_id
          WHERE ps.producto_id = p.id
            AND (
              LOWER(c.nombre) LIKE '%capilar%'
              OR LOWER(s.nombre) LIKE '%capilar%'
            )
        ) AS es_capilar
      FROM productos p
      WHERE p.slug = $1;
    `, [slug]);

   const producto = result.rows[0];

    if (!producto) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Producto no encontrado"
        })
      };
    }
 //como ya existe precio en la base de datos, se calculan los precios
// y se asignan a la propiedad precios del producto
 
    producto.precio= await calcularPrecio(producto,configuracion);

    return {
      statusCode: 200,
      body: JSON.stringify(producto)
    };

  } catch (error) {

    console.error('ERROR POSTGRES:', error);

    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };


  }

};
