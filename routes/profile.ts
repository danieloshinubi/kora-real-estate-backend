import express, { Router } from 'express';
import * as profileController from '../controllers/profileController';

const router: Router = express.Router();

router.post('/', profileController.createProfile);
router.get('/:userId', profileController.getProfileByUserId);

export { router };
