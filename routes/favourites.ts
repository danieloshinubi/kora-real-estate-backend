import express, { Router } from 'express';
import * as favouritesController from '../controllers/favouritesController';

const router: Router = express.Router();

router
  .route('/')
  .post(favouritesController.addFavorites)
  .delete(favouritesController.removeFavourites);

router.route('/:userId').get(favouritesController.getFavourites);

export { router };
