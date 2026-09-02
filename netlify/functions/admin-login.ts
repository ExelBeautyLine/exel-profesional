import { Handler } from "@netlify/functions";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./lib/db";

export const handler: Handler = async (event) => {

    if (event.httpMethod !== "POST") {

        return {
            statusCode: 405,
            body: JSON.stringify({
                error: "Método no permitido"
            })
        };

    }

    try {

        const body = JSON.parse(event.body || "{}");

        const email = body.email;
        const password = body.password;

        if (!email || !password) {

            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Email y contraseña son obligatorios"
                })
            };

        }

        const result = await pool.query(
            `
            SELECT id, email, password_hash
            FROM administradores
            WHERE email = $1
            AND activo = TRUE
            `,
            [email]
        );

        if (result.rows.length === 0) {

            return {
                statusCode: 401,
                body: JSON.stringify({
                    error: "Credenciales incorrectas"
                })
            };

        }

        const administrador = result.rows[0];

        const passwordCorrecta = await bcrypt.compare(
            password,
            administrador.password_hash
        );

        if (!passwordCorrecta) {

            return {
                statusCode: 401,
                body: JSON.stringify({
                    error: "Credenciales incorrectas"
                })
            };

        }

        const secret = process.env["ADMIN_JWT_SECRET"];

        if (!secret) {

            throw new Error(
                "ADMIN_JWT_SECRET no está configurada"
            );

        }

        const token = jwt.sign(
            {
                administradorId: administrador.id,
                email: administrador.email
            },
            secret,
            {
                expiresIn: "8h"
            }
        );

        return {

            statusCode: 200,

            headers: {
                "Set-Cookie":
                    `admin_token=${token}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax; Secure`
            },

            body: JSON.stringify({
                mensaje: "Login correcto"
            })

        };

    } catch (error) {

        console.error("Error login administrador:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Error interno del servidor"
            })
        };

    }

};