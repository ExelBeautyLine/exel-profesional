import { Handler } from '@netlify/functions';
import { pool } from './lib/db';

export const handler: Handler = async () => {

  try {

    const result = await pool.query(`
      SELECT *
      FROM productos
      LIMIT 10
    `);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };

  } catch (error) {

    console.error('ERROR POSTGRES:', error);

    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };


  }

};