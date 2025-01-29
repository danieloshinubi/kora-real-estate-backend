import express, { Router } from 'express';
import * as propertyTypeController from '../controllers/propertyTypeController';

const router: Router = express.Router();

router
  .route('/')
  .get(propertyTypeController.getAllPropertyTypes)
  .post(propertyTypeController.createPropertyType);

router.route('/:id').delete(propertyTypeController.deletePropertyType);

export { router };
