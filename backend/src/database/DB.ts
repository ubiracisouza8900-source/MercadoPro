import { Pool } from "pg";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL não configurada!");
} else {
  try {
    const url = new URL(databaseUrl);

    console.log("🔎 CONFIGURAÇÃO DO BANCO:");
    console.log("Host:", url.hostname);
    console.log("Porta:", url.port);
    console.log("Usuário:", url.username);
  } catch (erro) {
    console.error("❌ DATABASE_URL inválida.");
  }
}

const pool = new Pool({
  connectionString: databaseUrl,

  ssl: {
    rejectUnauthorized: false,
  },
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