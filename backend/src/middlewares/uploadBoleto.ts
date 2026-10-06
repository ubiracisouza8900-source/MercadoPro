import multer from "multer";
import path from "path";
import fs from "fs";

const pastaBoletos = process.env.VERCEL
  ? "/tmp/boletos"
  : path.resolve(
      process.cwd(),
      "arquivos",
      "boletos"
    );

if (!fs.existsSync(pastaBoletos)) {
  fs.mkdirSync(pastaBoletos, {
    recursive: true,
  });
}

const armazenamento = multer.diskStorage({
  destination: (
    _req,
    _file,
    cb
  ) => {
    cb(null, pastaBoletos);
  },

  filename: (
    _req,
    file,
    cb
  ) => {
    const extensao =
      path.extname(file.originalname);

    const nomeArquivo =
      `boleto_${Date.now()}${extensao}`;

    cb(null, nomeArquivo);
  },
});

const filtroArquivo =
  (
    _req,
    file,
    cb
  ) => {
    if (
      file.mimetype !==
      "application/pdf"
    ) {
      cb(
        new Error(
          "Apenas arquivos PDF são permitidos."
        )
      );

      return;
    }

    cb(null, true);
  };

export const uploadBoleto = multer({
  storage: armazenamento,
  fileFilter: filtroArquivo,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});