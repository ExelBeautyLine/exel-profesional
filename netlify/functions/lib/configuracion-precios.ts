import { pool } from "./db";
import { Cuota } from "./cuotas";

export interface ConfiguracionPrecios {

    mediosPago: {

        nombre: string;

        porcentaje_descuento: number;

        porcentaje_recargo: number;

    }[];

    cuotas: Cuota[];

}

export async function obtenerConfiguracionPrecios(): Promise<ConfiguracionPrecios> {

    // Medios de pago
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

    // Cuotas
    const cuotasResult = await pool.query(`
        SELECT
            cantidad_cuotas,
            porcentaje_recargo
        FROM cuotas
        WHERE activo = TRUE
        ORDER BY cantidad_cuotas;
    `);

    return {

        mediosPago: mediosResult.rows.map((medio: any) => ({
            nombre: medio.nombre.trim(),
            porcentaje_descuento: Number(medio.porcentaje_descuento),
            porcentaje_recargo: Number(medio.porcentaje_recargo)
        })),

        cuotas: cuotasResult.rows

    };

}