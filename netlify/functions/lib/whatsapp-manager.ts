import { CrearPedidoRequest } from "./pedidos-manager";
import { calcularResumen } from "./calcular-resumen";

export function generarMensajeWhatsapp(

    pedidoId: number,

    body: CrearPedidoRequest,

    resumen: Awaited<ReturnType<typeof calcularResumen>>

): string {

    const total = body.pago === "transferencia"

        ? resumen.totalTransferencia

        : resumen.totalTarjeta;

    const productos = resumen.items
        .map(item => `• ${item.producto.nombre} x${item.cantidad}`)
        .join("\n");

    const mensaje = `Hola! Quiero confirmar mi pedido.

Pedido Nº ${pedidoId}

Cliente:
${body.cliente.nombre} ${body.cliente.apellido}
${body.cliente.telefono}
${body.cliente.email}

Productos:
${productos}

Total: $${total}`;

    return encodeURIComponent(mensaje);

}