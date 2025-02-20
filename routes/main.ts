import { Application } from 'express';
import { router as AuthRouter } from './auth';
import { router as PropertyTypeRouter } from './propertyType';
import { router as ProfileRouter } from './profile';
import { router as UserRouter } from './user';
import { router as AmenitiesRouter } from './amenities';
import { router as ListingRouter } from './listings';
import { router as ReviewRouter } from './review';
import { router as TransactionRouter } from './transaction';

const routes = (app: Application): void => {
  app.use('/auth', AuthRouter);
  app.use('/property-types', PropertyTypeRouter);
  app.use('/profile', ProfileRouter);
  app.use('/user', UserRouter);
  app.use('/amenities', AmenitiesRouter);
  app.use('/listings', ListingRouter);
  app.use('/review', ReviewRouter);
  app.use('/transaction', TransactionRouter);
};

export { routes };
