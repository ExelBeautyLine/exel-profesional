import { Resend } from "resend";

const resend = new Resend(

    process.env.RESEND_API_KEY

);

export async function enviarMailAdministrador(

    pedidoId: number

): Promise<void> {

    await resend.emails.send({

        from: "Exel Profesional <onboarding@resend.dev>",

        to: "exelprofessionalline1@gmail.com",

        subject: `Nuevo pedido #${pedidoId}`,

        html: `

            <h2>Nuevo pedido recibido</h2>

            <p>Pedido Nº <strong>${pedidoId}</strong></p>

        `

    });

}

export async function enviarMailCliente(

    pedidoId: number,

    email: string

): Promise<void> {

    await resend.emails.send({

        from: "Exel Profesional <onboarding@resend.dev>",

        to: email,

        subject: `Recibimos tu pedido #${pedidoId}`,

        html: `

            <h2>¡Gracias por tu compra!</h2>

            <p>

                Tu pedido fue recibido correctamente.

            </p>

            <p>

                Número de pedido:

                <strong>${pedidoId}</strong>

            </p>

        `

    });

}