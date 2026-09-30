
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.query("SELECT NOW()")
  .then((resultado) => {
    console.log("✅ PostgreSQL conectado!");
    console.log("Hora do banco:", resultado.rows[0]);
  })
  .catch((erro) => {
    console.error("❌ Erro ao conectar no PostgreSQL:");
    console.error(erro);
  });

export default db;
