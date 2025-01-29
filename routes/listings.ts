import express, { Router } from 'express';
import * as listingsController from '../controllers/listingsController';

const router: Router = express.Router();

router
  .route('/')
  .post(listingsController.createListing)
  .get(listingsController.getAllListings);

router.route('/:id').delete(listingsController.deleteListing);

export { router };
