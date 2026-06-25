import { Handler } from "@netlify/functions";
import { pool } from "./lib/db";

export const handler: Handler = async () => {

  try {

    const result = await pool.query(`
      SELECT
          c.id,
          c.nombre,

          s.id AS subcategoria_id,
          s.nombre AS subcategoria_nombre

      FROM categorias c

      LEFT JOIN subcategorias s
          ON s.categorias_id = c.id

      ORDER BY c.nombre, s.nombre
    `);

    const menu: any[] = [];

    result.rows.forEach(row => {

      let categoria = menu.find(c => c.id === row.id);

      if (!categoria) {

        categoria = {
          id: row.id,
          nombre: row.nombre,
          subcategorias: []
        };

        menu.push(categoria);
      }

      if (row.subcategoria_id) {

        categoria.subcategorias.push({
          id: row.subcategoria_id,
          nombre: row.subcategoria_nombre
        });

      }

    });

    return {
      statusCode: 200,
      body: JSON.stringify(menu)
    };

  } catch (error) {

    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };

  }

};