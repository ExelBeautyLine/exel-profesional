import { Handler } from "@netlify/functions";
import { pool } from "./lib/db";

const ordenSubcategorias: Record<string, string[]> = {
  facial: [
    'limpieza',
    'exfoliante',
    'tonificacion',
    'correccion',
    'hidratacion',
    'contorno de ojos',
    'labios',
    'cejas y pestanas',
    'proteccion solar'
  ],
  corporal: [
    'reafirmante y celulitis',
    'estrias',
    'hidratacion',
    'anti age',
    'proteccion solar',
    'limpieza y exfoliacion',
    'piernas cansadas',
    'tonificacion',
    'autobronceantes'
  ],
  capilar: [
    'uso diario',
    'permanentados y tenidos',
    'secos tenidos y castigados',
    'caida de cabello',
    'cabellos grasos y caspa',
    'termoproteccion',
    'cremas lociones y ceras',
    'mascaras capilares',
    'solidos'
  ]
};

const ordenCategorias = ['facial', 'corporal', 'capilar', 'rutinas'];

function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function categoriaOrdenable(nombre: string): string | null {
  const categoria = normalizarTexto(nombre);

  if (categoria.includes('facial')) return 'facial';
  if (categoria.includes('corporal')) return 'corporal';
  if (categoria.includes('capilar')) return 'capilar';
  if (categoria.includes('rutina')) return 'rutinas';

  return null;
}

export const handler: Handler = async () => {

  try {

    const result = await pool.query(`
      SELECT
          c.id,
          c.nombre,
          c.slug,

          s.id AS subcategoria_id,
          s.nombre AS subcategoria_nombre,
          s.slug AS subcategoria_slug

      FROM categorias c

      LEFT JOIN subcategorias s
          ON s.categorias_id = c.id

      ORDER BY c.nombre, s.nombre
    `);

    const menu: any[] = [];

    result.rows.forEach(row => {

      let categoria = menu.find(c => c.id === row.id);

      if (!categoria) {

        categoria = {
          id: row.id,
          nombre: row.nombre,
          slug: row.slug,
          subcategorias: []
        };

        menu.push(categoria);
      }

      if (row.subcategoria_id) {

        categoria.subcategorias.push({
          id: row.subcategoria_id,
          nombre: row.subcategoria_nombre,
          slug: row.subcategoria_slug
        });

      }

    });

    menu.forEach(categoria => {
      const tipoCategoria = categoriaOrdenable(categoria.nombre);
      const orden = tipoCategoria ? ordenSubcategorias[tipoCategoria] ?? [] : [];

      categoria.subcategorias.sort((primera: { nombre: string }, segunda: { nombre: string }) => {
        const posicionPrimera = orden.indexOf(normalizarTexto(primera.nombre));
        const posicionSegunda = orden.indexOf(normalizarTexto(segunda.nombre));
        const ordenPrimera = posicionPrimera === -1 ? Number.MAX_SAFE_INTEGER : posicionPrimera;
        const ordenSegunda = posicionSegunda === -1 ? Number.MAX_SAFE_INTEGER : posicionSegunda;

        return ordenPrimera - ordenSegunda ||
          primera.nombre.localeCompare(segunda.nombre, 'es');
      });
    });

    menu.sort((primera, segunda) => {
      const posicionPrimera = ordenCategorias.indexOf(categoriaOrdenable(primera.nombre) ?? '');
      const posicionSegunda = ordenCategorias.indexOf(categoriaOrdenable(segunda.nombre) ?? '');
      const ordenPrimera = posicionPrimera === -1 ? Number.MAX_SAFE_INTEGER : posicionPrimera;
      const ordenSegunda = posicionSegunda === -1 ? Number.MAX_SAFE_INTEGER : posicionSegunda;

      return ordenPrimera - ordenSegunda ||
        primera.nombre.localeCompare(segunda.nombre, 'es');
    });

    return {
      statusCode: 200,
      body: JSON.stringify(menu)
    };

  } catch (error) {

    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };

  }

};
