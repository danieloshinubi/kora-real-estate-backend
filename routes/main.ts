import { Application } from 'express';
import { router as AuthRouter } from './auth';

const routes = (app: Application): void => {
  app.use('/auth', AuthRouter);
};

export { routes };
