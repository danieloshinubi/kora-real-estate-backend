import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPropertyType extends Document {
  name: string;
}

const PropertyTypeSchema: Schema<IPropertyType> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const PropertyType: Model<IPropertyType> = mongoose.model<IPropertyType>(
  'PropertyType',
  PropertyTypeSchema
);

export default PropertyType;
