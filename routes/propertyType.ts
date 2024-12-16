import express, { Router } from 'express';
import * as propertyTypeController from '../controllers/propertyTypeController';

const router: Router = express.Router();

router.post('/', propertyTypeController.createPropertyType);
router.get('/', propertyTypeController.getAllPropertyTypes);
router.delete('/:id', propertyTypeController.deletePropertyType);

export { router };
