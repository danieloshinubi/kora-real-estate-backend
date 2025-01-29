import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IPropertyType } from './PropertyType';
import { IAmenities } from './Amenities';
import { IListingsImg } from './ListingsImg';

export interface IListings extends Document {
  name: string;
  description: string;
  amenities: Types.ObjectId[] | IAmenities[];
  propertyType: Types.ObjectId | IPropertyType;
  location: {
    longitude: number;
    latitude: number;
  };
  price: number;
  listingImg: Types.ObjectId[] | IListingsImg[];
  rating: number;
}

const ListingsSchema: Schema<IListings> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    amenities: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Amenities',
        required: true,
      },
    ],
    propertyType: {
      type: Schema.Types.ObjectId,
      ref: 'PropertyType',
      required: true,
    },
    location: {
      longitude: {
        type: Number,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    listingImg: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ListingsImg',
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Listings: Model<IListings> = mongoose.model<IListings>(
  'Listings',
  ListingsSchema
);

export default Listings;
