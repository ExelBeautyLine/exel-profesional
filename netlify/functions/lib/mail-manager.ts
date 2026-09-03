import { Resend } from "resend";
import { CrearPedidoRequest } from "./pedidos-manager";
import { calcularResumen } from "./calcular-resumen";

const resend = new Resend(process.env["RESEND_API_KEY"]);

const MARCA = "Exel Professional Line";
const EMAIL_VENTAS = "exelprofessionalline1@gmail.com";
const WHATSAPP_URL = "https://wa.me/542235353342";

type ResumenPedido = Awaited<ReturnType<typeof calcularResumen>>;

/** Escapa los datos ingresados por usuarios antes de interpolarlos en el HTML. */
function escaparHtml(valor: unknown): string {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatearImporte(valor: number): string {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(Number(valor) || 0);
}

function totalPedido(body: CrearPedidoRequest, resumen: ResumenPedido): number {
    return body.pago === "transferencia" ? resumen.totalTransferencia : resumen.totalTarjeta;
}

function subtotalPedido(body: CrearPedidoRequest, resumen: ResumenPedido): number {
    return body.pago === "transferencia" ? resumen.subtotalTransferencia : resumen.subtotalTarjeta;
}

function metodoPago(body: CrearPedidoRequest): string {
    return body.pago === "transferencia" ? "Transferencia bancaria" : "Tarjeta";
}

function detalleEntrega(body: CrearPedidoRequest): string {
    if (body.entrega === "retiro") return "Retiro en el local";

    const direccion = body.direccion;

    if (!direccion) return "Dirección a confirmar";

    const { calle, numero, piso, departamento, localidad, provincia, codigoPostal } = direccion;
    const unidad = [piso && `Piso ${piso}`, departamento && `Depto. ${departamento}`]
        .filter(Boolean)
        .join(", ");

    return [`${calle} ${numero}`, unidad, `${localidad}, ${provincia}`, `CP ${codigoPostal}`]
        .filter(Boolean)
        .join(" · ");
}

function filaInfo(etiqueta: string, valor: string): string {
    return `<tr>
        <td style="padding:0 0 12px;color:#6b7280;font-size:13px;line-height:19px;vertical-align:top;width:42%;">${etiqueta}</td>
        <td style="padding:0 0 12px;color:#1f2937;font-size:14px;font-weight:600;line-height:19px;vertical-align:top;">${valor}</td>
    </tr>`;
}

function encabezado(titulo: string, subtitulo: string): string {
    return `<tr>
        <td style="background:#173d36;padding:30px 32px 26px;border-radius:16px 16px 0 0;">
            <p style="margin:0 0 12px;color:#b9d7cd;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">${MARCA}</p>
            <h1 style="margin:0;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:27px;font-weight:700;letter-spacing:-0.4px;line-height:34px;">${titulo}</h1>
            <p style="margin:9px 0 0;color:#d8e8e2;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;">${subtitulo}</p>
        </td>
    </tr>`;
}

function pie(): string {
    return `<tr>
        <td style="padding:25px 30px 0;text-align:center;">
            <p style="margin:0;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">Este es un correo automático de ${MARCA}.</p>
            <p style="margin:7px 0 0;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">
                <a href="mailto:${EMAIL_VENTAS}" style="color:#376f61;text-decoration:underline;">${EMAIL_VENTAS}</a>
                <span style="color:#d1d5db;">&nbsp;|&nbsp;</span>
                <a href="${WHATSAPP_URL}" style="color:#376f61;text-decoration:underline;">WhatsApp</a>
            </p>
        </td>
    </tr>`;
}

function plantillaEmail(contenido: string): string {
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${MARCA}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Información de tu pedido en ${MARCA}.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f5;">
    <tr><td align="center" style="padding:30px 12px 38px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(26,49,43,0.08);">
        ${contenido}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function filasProductos(body: CrearPedidoRequest, resumen: ResumenPedido, mostrarCodigo: boolean): string {
    return resumen.items.map((item) => {
        const importe = body.pago === "transferencia" ? item.subtotalTransferencia : item.subtotalTarjeta;
        const codigo = mostrarCodigo
            ? `<p style="margin:4px 0 0;color:#8a9490;font-size:12px;line-height:16px;">Cód. ${escaparHtml(item.producto.codigo)}</p>`
            : "";

        return `<tr>
            <td style="padding:15px 0;border-bottom:1px solid #e9eeec;vertical-align:top;">
                <p style="margin:0;color:#1f2937;font-size:14px;font-weight:700;line-height:20px;">${escaparHtml(item.producto.nombre)}</p>${codigo}
            </td>
            <td align="center" style="padding:15px 8px;border-bottom:1px solid #e9eeec;color:#4b5563;font-size:14px;vertical-align:top;">${item.cantidad}</td>
            <td align="right" style="padding:15px 0;border-bottom:1px solid #e9eeec;color:#1f2937;font-size:14px;font-weight:700;white-space:nowrap;vertical-align:top;">${formatearImporte(importe)}</td>
        </tr>`;
    }).join("");
}

function tablaProductos(body: CrearPedidoRequest, resumen: ResumenPedido, mostrarCodigo = false): string {
    return `<h2 style="margin:28px 0 12px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:25px;">Productos</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <thead><tr>
            <th align="left" style="padding:0 0 9px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">Producto</th>
            <th align="center" style="padding:0 8px 9px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">Cant.</th>
            <th align="right" style="padding:0 0 9px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">Importe</th>
        </tr></thead>
        <tbody>${filasProductos(body, resumen, mostrarCodigo)}</tbody>
    </table>`;
}

function tablaTotales(body: CrearPedidoRequest, resumen: ResumenPedido): string {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:21px;background:#f3f8f6;border:1px solid #dceae5;border-radius:10px;">
        <tr>
            <td style="padding:17px 18px 7px;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:14px;">Subtotal</td>
            <td align="right" style="padding:17px 18px 7px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;">${formatearImporte(subtotalPedido(body, resumen))}</td>
        </tr>
        <tr>
            <td style="padding:7px 18px 17px;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:14px;">Envío</td>
            <td align="right" style="padding:7px 18px 17px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;">${formatearImporte(resumen.costoEnvio)}</td>
        </tr>
        <tr>
            <td style="padding:15px 18px;background:#173d36;border-radius:0 0 0 9px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;">Total</td>
            <td align="right" style="padding:15px 18px;background:#173d36;border-radius:0 0 9px 0;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:700;white-space:nowrap;">${formatearImporte(totalPedido(body, resumen))}</td>
        </tr>
    </table>`;
}

export async function enviarMailAdministrador(
    pedidoId: number,
    fecha: Date,
    body: CrearPedidoRequest,
    resumen: ResumenPedido
): Promise<void> {
    const fechaPedido = fecha.toLocaleString("es-AR", { dateStyle: "medium"});
    const telefono = body.cliente.telefono.replace(/\D/g, "");
    const enlaceWhatsappCliente = telefono ? `https://wa.me/549${telefono}` : "";
    const cliente = `${escaparHtml(body.cliente.nombre)} ${escaparHtml(body.cliente.apellido)}`;
    const entrega = body.entrega === "envio" ? "Envío a domicilio" : "Retiro en el local";
    const observaciones = body.direccion?.observaciones?.trim();

    const contenido = `${encabezado("Nuevo pedido recibido", `Pedido #${pedidoId} · ${escaparHtml(fechaPedido)}`)}
    <tr><td style="padding:29px 30px 4px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff8e8;border:1px solid #f2dfae;border-radius:10px;"><tr><td style="padding:13px 15px;color:#805b13;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;">Acción requerida: pedido pendiente de revisión.</td></tr></table>
        <h2 style="margin:27px 0 14px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:25px;">Datos del cliente</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${filaInfo("Nombre", cliente)}
            ${filaInfo("Email", `<a href="mailto:${escaparHtml(body.cliente.email)}" style="color:#376f61;text-decoration:underline;">${escaparHtml(body.cliente.email)}</a>`)}
            ${filaInfo("Teléfono", enlaceWhatsappCliente ? `<a href="${enlaceWhatsappCliente}" style="color:#376f61;text-decoration:underline;">${escaparHtml(body.cliente.telefono)}</a>` : escaparHtml(body.cliente.telefono))}
        </table>
        <h2 style="margin:14px 0 14px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:25px;">Entrega y pago</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${filaInfo("Modalidad", entrega)}
            ${filaInfo("Dirección", escaparHtml(detalleEntrega(body)))}
            ${filaInfo("Forma de pago", metodoPago(body))}
        </table>
        ${observaciones ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:3px;background:#f7f8f8;border-left:3px solid #7aa99c;"><tr><td style="padding:13px 15px;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;"><strong style="color:#1f2937;">Observaciones:</strong><br>${escaparHtml(observaciones)}</td></tr></table>` : ""}
        ${tablaProductos(body, resumen, true)}
        ${tablaTotales(body, resumen)}
        <p style="margin:16px 0 0;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">${resumen.items.length} productos distintos · ${resumen.cantidadItems} unidades en total</p>
    </td></tr>${pie()}`;

    const texto = [
        `NUEVO PEDIDO #${pedidoId}`,
        `Fecha: ${fechaPedido}`,
        "",
        `Cliente: ${body.cliente.nombre} ${body.cliente.apellido}`,
        `Email: ${body.cliente.email}`,
        `Teléfono: ${body.cliente.telefono}`,
        `Entrega: ${entrega}`,
        `Dirección: ${detalleEntrega(body)}`,
        `Pago: ${metodoPago(body)}`,
        "",
        "PRODUCTOS",
        ...resumen.items.map((item) => `${item.cantidad} x ${item.producto.nombre} — ${formatearImporte(body.pago === "transferencia" ? item.subtotalTransferencia : item.subtotalTarjeta)}`),
        "",
        `TOTAL: ${formatearImporte(totalPedido(body, resumen))}`
    ].join("\n");

    try {
        await resend.emails.send({
            from: "Exel Professional Line <ventas@exelprofessionalline.com>",
            to: EMAIL_VENTAS,
            subject: `Nuevo pedido #${pedidoId} · ${body.cliente.nombre} ${body.cliente.apellido}`,
            html: plantillaEmail(contenido),
            text: texto
        });
    } catch (error) {
        console.error("Error al enviar el correo de administración:", error);
    }
}

export async function enviarMailCliente(
    pedidoId: number,
    body: CrearPedidoRequest,
    resumen: ResumenPedido
): Promise<void> {
    const esTransferencia = body.pago === "transferencia";
    const esEnvio = body.entrega === "envio";
    const nombre = escaparHtml(body.cliente.nombre);
    const entrega = esEnvio ? "Envío a domicilio" : "Retiro en el local";
    const siguientePasoPago = esTransferencia
        ? "Te contactaremos para enviarte los datos bancarios y confirmar la acreditación del pago."
        : "Cuando el pago esté acreditado, comenzaremos a preparar tu pedido.";
    const siguientePasoEntrega = esEnvio
        ? "Al despacharlo, te avisaremos con la información para seguir el envío."
        : "Cuando esté listo, nos comunicaremos para coordinar el retiro.";

    const contenido = `${encabezado("¡Recibimos tu pedido!", `Gracias por elegir ${MARCA}.`)}
    <tr><td style="padding:30px 30px 4px;">
        <p style="margin:0;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;line-height:26px;">Hola, ${nombre}</p>
        <p style="margin:9px 0 0;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;">Tu compra fue registrada correctamente. Estamos listos para acompañarte en los próximos pasos.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px;background:#f3f8f6;border:1px solid #dceae5;border-radius:10px;"><tr>
            <td style="padding:17px 18px;"><p style="margin:0 0 4px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">Número de pedido</p><p style="margin:0;color:#173d36;font-family:Arial,Helvetica,sans-serif;font-size:23px;font-weight:700;line-height:28px;">#${pedidoId}</p></td>
            <td align="right" style="padding:17px 18px;"><p style="margin:0 0 4px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">Estado</p><p style="margin:0;color:#376f61;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;">Pedido recibido</p></td>
        </tr></table>
        ${tablaProductos(body, resumen)}
        ${tablaTotales(body, resumen)}
        <h2 style="margin:28px 0 12px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:25px;">Entrega</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f8f8;border-radius:10px;"><tr><td style="padding:15px 16px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;line-height:20px;">${entrega}</td></tr><tr><td style="padding:0 16px 15px;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;">${escaparHtml(detalleEntrega(body))}</td></tr></table>
        <h2 style="margin:28px 0 12px;color:#1f2937;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:25px;">¿Qué sigue?</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-left:3px solid #75a798;background:#f7fbf9;"><tr><td style="padding:15px 16px;color:#374151;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;"><strong style="color:#173d36;">1. ${metodoPago(body)}.</strong><br>${siguientePasoPago}</td></tr><tr><td style="padding:0 16px 15px;color:#374151;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;"><strong style="color:#173d36;">2. ${entrega}.</strong><br>${siguientePasoEntrega}</td></tr></table>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:25px;"><tr><td style="border-radius:8px;background:#376f61;"><a href="${WHATSAPP_URL}" style="display:inline-block;padding:13px 19px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;">Consultar por WhatsApp</a></td></tr></table>
        <p style="margin:14px 0 0;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">Guardá este correo para tener tu número de pedido a mano.</p>
    </td></tr>${pie()}`;

    const texto = [
        `¡RECIBIMOS TU PEDIDO #${pedidoId}!`,
        `Hola, ${body.cliente.nombre}. Tu compra fue registrada correctamente.`,
        "",
        "PRODUCTOS",
        ...resumen.items.map((item) => `${item.cantidad} x ${item.producto.nombre} — ${formatearImporte(esTransferencia ? item.subtotalTransferencia : item.subtotalTarjeta)}`),
        "",
        `Subtotal: ${formatearImporte(subtotalPedido(body, resumen))}`,
        `Envío: ${formatearImporte(resumen.costoEnvio)}`,
        `TOTAL: ${formatearImporte(totalPedido(body, resumen))}`,
        "",
        `Entrega: ${entrega}`,
        detalleEntrega(body),
        `Pago: ${metodoPago(body)}`,
        "",
        siguientePasoPago,
        siguientePasoEntrega,
        "",
        `Consultas: ${EMAIL_VENTAS} | ${WHATSAPP_URL}`
    ].join("\n");

    try {
        await resend.emails.send({
            from: "Exel Professional Line <ventas@exelprofessionalline.com>",
            to: body.cliente.email,
            subject: `Confirmación de tu pedido #${pedidoId}`,
            html: plantillaEmail(contenido),
            text: texto
        });
    } catch (error) {
        console.error("Error al enviar el correo al cliente:", error);
    }
}
