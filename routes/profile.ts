import express, { Router } from 'express';
import * as profileController from '../controllers/profileController';

const router: Router = express.Router();

router.route('/').post(profileController.createProfile);

router
  .route('/:userId')
  .get(profileController.getProfileByUserId)
  .patch(profileController.updateProfile);

export { router };
