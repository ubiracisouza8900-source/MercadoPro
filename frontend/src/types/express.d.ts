declare namespace Express {
  interface Request {
    usuario?: {
      id: number;
      perfil: string;
    };
  }
}