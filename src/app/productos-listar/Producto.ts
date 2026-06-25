export interface Producto{
    id: number;
    nombre: String;
    codigo: String;
    descripcion: String;
    presentacion: String
    ingredientes_activos: String;
    modo_uso: String;
    tipo_piel: String;
    beneficios: String;
    imagen_url: String,
    stock: number;
    precio_base: number;
    destacado: boolean;
    activo: boolean;
    slug: String;
}
