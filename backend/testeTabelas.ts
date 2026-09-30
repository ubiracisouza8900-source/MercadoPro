import db from "./src/database/DB";

async function testar() {
    try {
        const resultado = await db.query(`
            SELECT table_schema, table_name
            FROM information_schema.tables
            WHERE table_name = 'usuarios'
        `);

        console.log(resultado.rows);
    } catch (erro) {
        console.error("ERRO:", erro);
    } finally {
        await db.end();
    }
}

testar();