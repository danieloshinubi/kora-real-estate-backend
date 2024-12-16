import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IPropertyType } from './PropertyType';
import { IUser } from './User';

export interface IProfile extends Document {
  user: Types.ObjectId | IUser;
  propertyType: Types.ObjectId[] | IPropertyType[];
  bedrooms: number;
  pets: number;
  minPrice: number;
  maxPrice: number;
  location: {
    longitude: number;
    latitude: number;
  };
}

const ProfileSchema: Schema<IProfile> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyType: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PropertyType',
        required: true,
      },
    ],
    bedrooms: {
      type: Number,
      required: true,
    },
    pets: {
      type: Number,
      required: true,
    },
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
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
  },
  { timestamps: true }
);

const Profile: Model<IProfile> = mongoose.model('Profile', ProfileSchema);

export default Profile;
