import { Pool } from "pg";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não configurada.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 5,
});

pool.on("error", (erro) => {
  console.error("❌ Erro no PostgreSQL:", erro);
});

export default pool;