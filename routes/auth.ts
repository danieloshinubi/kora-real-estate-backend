import express, { Router } from 'express';
import * as authController from '../controllers/authController';

const router: Router = express.Router();

const authRouter: Router = express.Router();
authRouter.get('/verify-account/:token', authController.verifyAccount);

authRouter.post('/signup', authController.handleNewUser);
authRouter.post('/login', authController.handleLogin);
authRouter.post('/forgotpassword', authController.forgotPassword);
authRouter.post('/resetpassword', authController.resetPassword);

router.use('/user', authRouter);
export { router };
