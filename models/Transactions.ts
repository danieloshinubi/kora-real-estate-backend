import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { IListings } from './Listings';

export interface ITransaction extends Document {
  user: Types.ObjectId | IUser;
  listing: Types.ObjectId | IListings;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
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
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> = mongoose.model(
  'Transaction',
  TransactionSchema
);

export default Transaction;
