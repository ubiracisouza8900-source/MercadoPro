import { Pool } from "pg";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL não configurada!");
}

const pool = new Pool({
  connectionString: databaseUrl,

  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (erro) => {
  console.error("❌ Erro no PostgreSQL:", erro);
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

export default pool;