import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { IListings } from './Listings';

export interface IReview extends Document {
  user: Types.ObjectId | IUser;
  listing: Types.ObjectId | IListings;
  rating: number;
  comment: string;
}

const ReviewSchema: Schema<IReview> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listings',
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
