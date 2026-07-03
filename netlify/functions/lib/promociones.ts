import { pool } from "./db";

export async function obtenerMejorPromocion(productoId: number): Promise<number> {

    const result = await pool.query(`
        SELECT
            COALESCE(MAX(p.porcentaje_descuento), 0) AS descuento
        FROM promociones p

        LEFT JOIN promocion_producto pp
            ON pp.promociones_id = p.id

        LEFT JOIN promocion_categoria pc
            ON pc.promociones_id = p.id

        JOIN productos pr
            ON pr.id = $1

        JOIN subcategorias s
            ON s.id = pr.subcategorias_id

        WHERE
            p.activo = TRUE
            AND CURRENT_DATE BETWEEN p.fecha_inicio AND p.fecha_fin
            AND (
                pp.productos_id = pr.id
                OR
                pc.categorias_id = s.categorias_id
            );
    `, [productoId]);

    return Number(result.rows[0].descuento);

}