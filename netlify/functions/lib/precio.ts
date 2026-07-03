import { pool } from './db';
import { obtenerMejorPromocion } from "./promociones";
import { calcularCuotas, Cuota } from "./cuotas";



export interface ConfiguracionPrecios {
    mediosPago: {
        nombre: string;
        porcentaje_descuento: number;
        porcentaje_recargo: number;
    }[];

     cuotas: Cuota[];
}






export interface MedioPago {
    nombre: string;
    precio: number;
}

export interface CuotaCalculada {
    cantidad: number;
    interes: number;
    precioTotal: number;
    valorCuota: number;
}

export interface PrecioCalculado {

    base: number;
    final: number;
    descuento: number;
    transferencia: number;
    tarjeta: number;

    mediosPago: MedioPago[];
    cuotas: CuotaCalculada[];
}




export async function calcularPrecio(producto: any,configuracion: ConfiguracionPrecios): Promise<PrecioCalculado> {

    const descuentoPromocion = await obtenerMejorPromocion(producto.id);
    const precioPromocional = producto.precio_base *(1 - descuentoPromocion / 100);
    
    const mediosPago = configuracion.mediosPago.map((medio) => {

        let precio = precioPromocional;

        precio -= precio * (Number(medio.porcentaje_descuento) / 100);

        precio += precio * (Number(medio.porcentaje_recargo) / 100);

        return {
            nombre: medio.nombre.trim(),
            precio: Number(precio.toFixed(2))
        };

    });
    
    const transferencia = mediosPago.find(
    medio => medio.nombre === "Transferencia"
    );

    const tarjeta = mediosPago.find(
    (medio: any) => medio.nombre.trim() === "Tarjeta"
    );
    

    const cuotas = await calcularCuotas(
        tarjeta ? tarjeta.precio : precioPromocional,
        configuracion.cuotas
    );


    return {

        base: producto.precio_base,

        final: precioPromocional,

        descuento: descuentoPromocion,

        transferencia: transferencia
            ? transferencia.precio
            : precioPromocional,

        tarjeta: tarjeta
            ? tarjeta.precio
            : precioPromocional,

        cuotas

    };

}