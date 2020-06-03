import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsController {

	async show(request: Request, response: Response) {
		const { id } = request.params;

		const point = await knex('points').where('id', id).first();

		if(!point){
			return response.status(400).json({ message: 'Point not found' });
		}

		const itens = await knex('itens')
			.join('point_itens', 'itens.id', '=', 'point_itens.item_id')
			.where('point_itens.point_id', id);

		return response.json({ point, itens });
	}

	async create(request: Request, response: Response) {
		const {
			name,
			email,
			whatsapp,
			latitude,
			longitute,
			city,
			uf,
			itens
		} = request.body;

		const trx = await knex.transaction();

		const point = {
			image: 'https://images.unsplash.com/photo-1562684750-0553aea79845?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
			name,
			email,
			whatsapp,
			latitude,
			longitute,
			city,
			uf
		}

		const insertedIds = await trx('points').insert(point);
		const point_id = insertedIds[0];

		const pointItens = itens.map((item_id: Number) => {
			return {
				item_id,
				point_id: point_id,
			};
		});

		await trx('point_itens').insert(pointItens);
		await trx.commit();

		return response.json({ ...point, id: point_id });
	}

	async index(request: Request, response: Response) {
		const { city, uf, itens } = request.query;
		const parsedItens = String(itens)
			.split(',')
			.map(item => Number(item.trim()));

		const points = await knex('points')
			.join('point_itens', 'points.id', '=', 'point_itens.point_id')
			.whereIn('point_itens.item_id', parsedItens)			
			.where('city', String(city))
			.where('uf', String(uf))
			.distinct()
			.select('points.*')

		return response.json(points);	
	}
}

export default PointsController;