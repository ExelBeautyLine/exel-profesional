import { pool } from "./db";

export interface CuotaCalculada {
    cantidad: number;
    interes: number;
    precioTotal: number;
    valorCuota: number;
}

export interface Cuota {

    cantidad_cuotas: number;
    porcentaje_recargo: number;

}

export function calcularCuotas(

    precio: number,
    cuotasDB: Cuota[]

): CuotaCalculada[] {

    return cuotasDB.map(cuota => {

        const interes = Number(cuota.porcentaje_recargo);

        const precioTotal =
            precio * (1 + interes / 100);

        return {

            cantidad: cuota.cantidad_cuotas,

            interes,

            precioTotal: Number(precioTotal.toFixed(2)),

            valorCuota: Number(
                (precioTotal / cuota.cantidad_cuotas).toFixed(2)
            )

        };

    });

}