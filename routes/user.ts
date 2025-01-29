import express, { Router } from 'express';
import * as userController from '../controllers/userController';

const router: Router = express.Router();

router.route('/').get(userController.getAllUsers);

router
  .route('/:userId')
  .get(userController.getUserById)
  .delete(userController.deleteUser);

export { router };
