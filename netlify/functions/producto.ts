import { Handler } from '@netlify/functions';
import { pool } from './lib/db';
import { calcularPrecio } from './lib/precio';

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

    //mediosPago
      const mediosResult = await pool.query(`
      SELECT
          tp.nombre,
          cp.porcentaje_descuento,
          cp.porcentaje_recargo
      FROM tipo_precio tp
      INNER JOIN configuracion_precios cp
          ON tp.id = cp.tipo_precio_id
      ORDER BY tp.id;
    `);
    //cuotas
    const cuotasResult = await pool.query(`
      SELECT
          cantidad_cuotas,
          porcentaje_recargo
      FROM cuotas
      WHERE activo = TRUE
      ORDER BY cantidad_cuotas;
    `);

    const configuracion = {
      mediosPago: mediosResult.rows.map((medio: any) => ({
          nombre: medio.nombre.trim(),
          porcentaje_descuento: Number(medio.porcentaje_descuento),
          porcentaje_recargo: Number(medio.porcentaje_recargo)
      })),
      cuotas: cuotasResult.rows
    };


    const result = await pool.query(`
      SELECT *
      FROM productos
      WHERE slug = $1;
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