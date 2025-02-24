import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IUser } from './User';

export interface IFavourites extends Document {
  user: Types.ObjectId | IUser;
  listing: Types.ObjectId[];
}

const FavoritesSchema: Schema<IFavourites> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Listings',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Favourites: Model<IFavourites> = mongoose.model(
  'Favourites',
  FavoritesSchema
);

export default Favourites;
