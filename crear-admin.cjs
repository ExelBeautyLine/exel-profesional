require("dotenv").config();

const bcrypt = require("bcrypt");
const readline = require("readline");
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Email del administrador: ", async (email) => {

    rl.question("Contraseña: ", async (password) => {

        try {

            const passwordHash = await bcrypt.hash(password, 12);

            await pool.query(
                `
                INSERT INTO administradores
                    (email, password_hash)
                VALUES
                    ($1, $2)
                `,
                [email, passwordHash]
            );

            console.log("Administrador creado correctamente.");

        } catch (error) {

            console.error("Error al crear administrador:", error);

        } finally {

            await pool.end();
            rl.close();

        }

    });

});