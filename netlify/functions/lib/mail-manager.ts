import { Resend } from "resend";
import { CrearPedidoRequest } from "./pedidos-manager";
import { calcularResumen } from "./calcular-resumen";

const resend = new Resend(

    process.env["RESEND_API_KEY"]

);

export async function enviarMailAdministrador(


    pedidoId: number,

    fecha: Date,

    body: CrearPedidoRequest,

    resumen: Awaited<ReturnType<typeof calcularResumen>>

): Promise<void> {



    const total =

        body.pago === "transferencia"

            ? resumen.totalTransferencia

            : resumen.totalTarjeta;


    const htmlEntrega =

        body.entrega === "envio"

            ? `

            <h3>Entrega</h3>

            <p>

                <b>Tipo:</b> Envío<br>

                <b>Provincia:</b> ${body.direccion.provincia}<br>

                <b>Localidad:</b> ${body.direccion.localidad}<br>

                <b>Código Postal:</b> ${body.direccion.codigoPostal}<br>

                <b>Calle:</b> ${body.direccion.calle}<br>

                <b>Número:</b> ${body.direccion.numero}<br>

                <b>Piso:</b> ${body.direccion.piso || "-"}<br>

                <b>Departamento:</b> ${body.direccion.departamento || "-"}<br>

                <b>Observaciones:</b> ${body.direccion.observaciones || "-"}

            </p>

            `

            : `

            <h3>Entrega</h3>

            <p>

                <b>Retiro en local</b>

            </p>

        `;

    const htmlProductos =

        resumen.items

            .map(item => `

        <tr>

            <td>

                ${item.producto.codigo}

            </td>

            <td>

                ${item.producto.nombre}

            </td>

            <td style="text-align:center">

                ${item.cantidad}

            </td>

            <td style="text-align:right">

                $${body.pago === "transferencia"

                    ? item.subtotalTransferencia

                    : item.subtotalTarjeta

                }

            </td>

      </tr>

    `).join("");


    const fechaPedido = fecha.toLocaleString("es-AR", {

        dateStyle: "short",

        timeStyle: "short"

    });


    const htmlObservaciones =

        body.direccion?.observaciones?.trim()

            ? `

            <h3>Observaciones</h3>

            <p>

                ${body.direccion.observaciones}

            </p>

        `

            : "";

    const htmlCliente = `
     <h3>Cliente</h3>

        <p>

            <b>Estado:</b>

            Pendiente

        </p>


        <b>Nombre:</b> ${body.cliente.nombre} ${body.cliente.apellido}<br>

        <b>Email:</b>

            <a href="mailto:${body.cliente.email}">

                ${body.cliente.email}

            </a>

        <b>Teléfono:</b>

            <a href="https://wa.me/549${body.cliente.telefono.replace(/\D/g, "")}">

                ${body.cliente.telefono}

        </a>

        </p> `;


    const htmlResumen = `
        <h3>Pago</h3>

        <p>

            <b>Forma de pago:</b>

                ${body.pago === "transferencia"

            ? "Transferencia bancaria"

            : "Tarjeta"

        }

        </p>

<h3>Resumen</h3>

<table
    border="1"
    cellspacing="0"
    cellpadding="6"
    style="border-collapse:collapse;width:350px;"
>

    <tr>

        <td>Subtotal</td>

        <td style="text-align:right">

            $${body.pago === "transferencia"

            ? resumen.subtotalTransferencia

            : resumen.subtotalTarjeta

        }

        </td>

    </tr>

    <tr>

        <td>Envío</td>

        <td style="text-align:right">

            $${resumen.costoEnvio}

        </td>

    </tr>

    <tr>

        <th
            style="
                background:#198754;
                color:white;
                font-size:18px;
            "
        >

            TOTAL

        </th>

        <th
            style="
                background:#198754;
                color:white;
                text-align:right;
                font-size:18px;
            "
        >

            $${body.pago === "transferencia"

            ? resumen.totalTransferencia

            : resumen.totalTarjeta

        }

            </th>

        </tr>

    </table>
    <br>

    <p>

        <b>Cantidad de productos distintos:</b>

        ${resumen.items.length}

    </p>

    <p>

        <b>Unidades totales:</b>

        ${resumen.cantidadItems}

    </p>


    `;

    const htmlSistema = `

<hr>

<p
    style="
        color:#666;
        font-size:12px;
    "
>

    Pedido ID:

    ${pedidoId}

</p>

`;

    const htmlHeader = `

    <div
        style="
            background:#198754;
            padding:20px;
            text-align:center;
            color:white;
            border-radius:8px 8px 0 0;
        "
        >

        <h1
            style="
                margin:0;
            "
        >

            Exel Profesional

        </h1>

        <p
            style="
                margin-top:10px;
            "
        >

            Nuevo pedido recibido

        </p>

    </div>

    `;

    const html = `

        ${htmlHeader}

        <div
            style="
                padding:20px;
                font-family:Arial,Helvetica,sans-serif;
            "
        >

            <h2>

            Pedido #${pedidoId}

            </h2>

            <p>

                <b>Fecha:</b> ${fechaPedido}

            </p>
        </div>

        ${htmlCliente}
        ${htmlEntrega}

        ${htmlObservaciones}

        <h3>Productos</h3>

            <table
                border="1"
                cellspacing="0"
                cellpadding="6"
                style="border-collapse:collapse;width:100%;"
            >

            <thead>

                <tr>

                    <th>Código</th>

                    <th>Producto</th>

                    <th>Cantidad</th>

                    <th>Subtotal</th>

                </tr>

            </thead>

            <tbody>

                ${htmlProductos}

            </tbody>
        
            ${htmlResumen}

            ${htmlSistema}

        
    `;

    try {

        await resend.emails.send({

            from: "Exel Profesional <onboarding@resend.dev>",

            to: "exelbeautyline@gmail.com",

            subject: `🛒 Pedido #${pedidoId} - ${body.cliente.nombre} ${body.cliente.apellido}`,

            html

        });

    } catch (error) {

        console.error("Error Resend:");

        console.error(error);

    }
}





    export async function enviarMailCliente(

        pedidoId: number,

        body: CrearPedidoRequest,

        resumen: Awaited<ReturnType<typeof calcularResumen>>,


        ): Promise<void> {

            const htmlProductos =

            resumen.items

                .map(item => `

                    <tr>

                        <td>

                            ${item.producto.nombre}

                        </td>

                        <td style="text-align:center">

                            ${item.cantidad}

                        </td>

                        <td style="text-align:right">

                            $${

                                body.pago === "transferencia"

                                    ? item.subtotalTransferencia

                                    : item.subtotalTarjeta

                            }

                        </td>

                    </tr>

                `)

                .join("");


            const htmlEntrega =

                body.entrega === "envio"

                    ? `

                        <h3>Entrega</h3>

                        <p>

                            Envío a domicilio

                        </p>

                        <p>

                            ${body.direccion.calle} ${body.direccion.numero}<br>

                            ${body.direccion.localidad}<br>

                            ${body.direccion.provincia}<br>

                            CP: ${body.direccion.codigoPostal}

                        </p>

                    `

                    : `

                        <h3>Entrega</h3>

                        <p>

                            Retiro en el local.

                        </p>

                    `;        
            
                    const htmlResumen = `

                    <h3>

                        Resumen

                    </h3>

                    <table
                        border="1"
                        cellspacing="0"
                        cellpadding="6"
                        style="border-collapse:collapse;width:350px;"
                    >

                        <tr>

                            <td>Forma de pago</td>

                            <td>

                                ${

                                    body.pago === "transferencia"

                                        ? "Transferencia"

                                        : "Tarjeta"

                                }

                            </td>

                        </tr>

                        <tr>

                            <td>Subtotal</td>

                            <td style="text-align:right">

                                $${

                                    body.pago === "transferencia"

                                        ? resumen.subtotalTransferencia

                                        : resumen.subtotalTarjeta

                                }

                            </td>

                        </tr>

                        <tr>

                            <td>Envío</td>

                            <td style="text-align:right">

                                $${resumen.costoEnvio}

                            </td>

                        </tr>

                        <tr>

                            <th>Total</th>

                            <th style="text-align:right">

                                $${

                                    body.pago === "transferencia"

                                        ? resumen.totalTransferencia

                                        : resumen.totalTarjeta

                                }

                            </th>

                        </tr>

                    </table>

             `;

            const htmlHeader = `

                <div
                    style="
                        background:#2f6f5f;
                        color:white;
                        padding:30px;
                        text-align:center;
                    "
                >

                    <h1
                        style="
                            margin:0;
                            font-family:Arial,Helvetica,sans-serif;
                        "
                    >

                        Exel Profesional

                    </h1>

                    <p
                        style="
                            margin-top:10px;
                            font-size:16px;
                        "
                    >

                        ¡Gracias por tu compra!

                    </p>

                </div>

            `;        

            const html = `

            ${htmlHeader}

            <div
                style="
                    padding:30px;
                    font-family:Arial,Helvetica,sans-serif;
                    color:#333;
                "
            >

            <h2>

            Hola ${body.cliente.nombre} 👋

            </h2>

            <p>

            Recibimos correctamente tu pedido y comenzaremos a prepararlo.

            </p>

            <p>

            <b>Número de pedido:</b>

            #${pedidoId}

            </p>

            ${htmlProductos}

            ${htmlEntrega}

            ${htmlResumen}

            <hr>

            <h3>

            ¿Qué sigue ahora?

            </h3>

            <p>

            ${

                body.pago === "transferencia"

                    ? `

                    En las próximas horas nos comunicaremos con vos para enviarte los datos de la transferencia y confirmar el pago.

                    `

                    : `

                    Una vez acreditado el pago comenzaremos a preparar tu pedido.

                    `

            }

            </p>

            <p>

            ${

                body.entrega === "envio"

                    ? `

                    Cuando el pedido sea despachado te avisaremos para que puedas realizar el seguimiento del envío.

                    `

                    : `

                    Cuando el pedido esté preparado nos comunicaremos para coordinar el retiro en el local.

                    `

            }

            </p>

            <hr>

            <p>

            Si tenés alguna consulta podés responder este correo o escribirnos por WhatsApp.

            </p>

            <p>

            Muchas gracias por confiar en

            <b>Exel Profesional</b> ❤️

            </p>

            </div>

            `;



        try {
            
            await resend.emails.send({

                from: "Exel Profesional <onboarding@resend.dev>",

                to: body.cliente.email,

                subject: `Recibimos tu pedido #${pedidoId}`,

                html: html

            });


        }
        catch (error) {
            console.error("Error Resend cliente:");

            console.error(error);

        }

    }