import express, { Router } from 'express';
import * as amenityController from '../controllers/amenityController';

const router: Router = express.Router();

router
  .route('/')
  .post(amenityController.createAmenities)
  .get(amenityController.getAllAmenities);

router.route('/:id').delete(amenityController.deleteAmenity);

export { router };
