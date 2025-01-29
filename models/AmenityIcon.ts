import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAmenityIcon extends Document {
  fileUrl: string;
  fileType: string;
  fileName: string;
  public_id: string;
}

const AmenityIconSchema: Schema<IAmenityIcon> = new Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AmenityIcon: Model<IAmenityIcon> = mongoose.model<IAmenityIcon>(
  'AmenityIcon',
  AmenityIconSchema
);

export default AmenityIcon;
