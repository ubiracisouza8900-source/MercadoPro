import { Request, Response, NextFunction } from "express";
import { ProdutoService } from "../services/ProdutoService";

export const ProdutoController = {
async listar(req: Request, res: Response, next: NextFunction) {
try {
const produtos = await ProdutoService.listar();
return res.json(produtos);
} catch (erro) {
return next(erro);
}
},

async buscarPorCodigo(req: Request, res: Response, next: NextFunction) {
try {
const produto = await ProdutoService.buscarPorCodigo(req.params.codigo);
return res.json(produto);
} catch (erro) {
return next(erro);
}
},

async criar(req: Request, res: Response, next: NextFunction) {
try {
const produto = await ProdutoService.criar(req.body);
return res.status(201).json(produto);
} catch (erro) {
return next(erro);
}
},

async atualizar(req: Request, res: Response, next: NextFunction) {
try {
const produto = await ProdutoService.atualizar(
Number(req.params.id),
req.body
);
return res.json(produto);
} catch (erro) {
return next(erro);
}
},

async remover(req: Request, res: Response, next: NextFunction) {
try {
await ProdutoService.remover(Number(req.params.id));
return res.status(204).send();
} catch (erro) {
return next(erro);
}
},

/**

* Usado pela tela de Estoque.
  */
  async estoque(req: Request, res: Response, next: NextFunction) {
  try {
  const produtos = await ProdutoService.listar();
  return res.json(produtos);
  } catch (erro) {
  return next(erro);
  }
  }
  };
