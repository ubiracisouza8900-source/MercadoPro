import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool
  .connect()
  .then((client) => {
    console.log("✅ PostgreSQL conectado!");
    client.release();
  })
  .catch((erro) => {
    console.error(
      "❌ Erro ao conectar ao PostgreSQL:",
      erro
    );
  });

pool
  .query("SELECT NOW()")
  .then((resultado) => {
    console.log(
      "Hora do banco:",
      resultado.rows[0]
    );
  })
  .catch((erro) => {
    console.error(
      "❌ Erro ao consultar PostgreSQL:",
      erro
    );
  });

export default pool;