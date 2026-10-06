import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
    console.error("❌ Erro ao conectar ao PostgreSQL:", erro);
  });

export default pool;