import { pool } from "./db";

export interface PromocionAplicada {
    descuento: number;
    acumulable: boolean;
}


export async function obtenerMejorPromocion(productoId: number): Promise<PromocionAplicada> {

    const result = await pool.query(`
    SELECT
        p.porcentaje_descuento,
        p.acumulable
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
        )

    ORDER BY p.porcentaje_descuento DESC

    LIMIT 1;
`, [productoId]);

    if (result.rows.length === 0) {
        return {
            descuento: 0,
            acumulable: true
        };
    }

    return {
        descuento: Number(result.rows[0].porcentaje_descuento),
        acumulable: result.rows[0].acumulable
    };
}