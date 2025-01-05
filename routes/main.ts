import { Application } from 'express';
import { router as AuthRouter } from './auth';
import { router as PropertyTypeRouter } from './propertyType';
import { router as ProfileRouter } from './profile';
import { router as UserRouter } from './user';

const routes = (app: Application): void => {
  app.use('/auth', AuthRouter);
  app.use('/property-types', PropertyTypeRouter);
  app.use('/profile', ProfileRouter);
  app.use('/user', UserRouter);
};

export { routes };
