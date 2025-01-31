import express, { Router } from 'express';
import * as reviewController from '../controllers/reviewController';

const router: Router = express.Router();

router.route('/').post(reviewController.createReview);

router.route('/:listingId').get(reviewController.getReviewById);

router.route('/:id').delete(reviewController.deleteReview);

export { router };
