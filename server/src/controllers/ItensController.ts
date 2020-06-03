import knex from '../database/connection';
import { Request, Response } from 'express';

class ItensController {
  async index(request: Request, response: Response) {
    const itens = await knex('itens').select('*');

    const serializeItens = itens.map(item => {
      return {
        id: item.id,
        titulo: item.titulo,
        image_url: `http://localhost:3333/uploads/${item.image}`
      }
    });
    return response.json(serializeItens);
  }
}

export default ItensController;