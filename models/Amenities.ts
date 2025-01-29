import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IAmenityIcon } from './AmenityIcon';

export interface IAmenities extends Document {
  name: string;
  icon: Types.ObjectId | IAmenityIcon;
}

const AmenitiesSchema: Schema<IAmenities> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: Schema.Types.ObjectId,
      ref: 'AmenityIcon',
      required: true,
    },
  },
  { timestamps: true }
);

const Amenities: Model<IAmenities> = mongoose.model<IAmenities>(
  'Amenities',
  AmenitiesSchema
);

export default Amenities;
