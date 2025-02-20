import express, { Router } from 'express';
import * as transactionController from '../controllers/transactionController';

const router: Router = express.Router();

router.route('/').post(transactionController.createTransaction);

router.route('/:userId/:listingId').get(transactionController.getTransaction);

export { router };
