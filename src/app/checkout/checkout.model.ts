export interface Cliente {

    nombre: string;

    apellido: string;

    email: string;

    telefono: string;

}

export interface Direccion {

    provincia: string;

    localidad: string;

    codigoPostal: string;

    calle: string;

    numero: string;

    piso?: string;

    departamento?: string;

    observaciones?: string;

}

export type MetodoEntrega =

    'retiro'

    | 'envio';

export type MetodoPago =

    'transferencia'

    | 'tarjeta';

export interface Checkout {

    cliente: Cliente;

    direccion?: Direccion;

    entrega: MetodoEntrega;

    pago: MetodoPago;

    cuotas: number;

}