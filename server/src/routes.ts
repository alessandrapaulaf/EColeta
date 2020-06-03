import express from 'express';
import PointsController from '../src/controllers/PointsController';
import ItensController from '../src/controllers/ItensController';

const routes = express.Router();

const itensController = new ItensController();
routes.get('/itens', itensController.index);

const pointsController = new PointsController();
routes.post('/points', pointsController.create);
routes.get('/points/:id', pointsController.show);
routes.get('/points/', pointsController.index);

export default routes;