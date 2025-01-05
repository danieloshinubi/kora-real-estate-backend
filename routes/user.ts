import express, { Router } from 'express';
import * as userController from '../controllers/userController';

const router: Router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);
router.delete('/:userId', userController.deleteUser);

export { router };
