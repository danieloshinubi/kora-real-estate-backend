import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IListingsImg extends Document {
  fileUrl: string;
  fileType: string;
  fileName: string;
  public_id: string;
}

const ListingsImgSchema: Schema<IListingsImg> = new Schema(
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

const ListingsImg: Model<IListingsImg> = mongoose.model<IListingsImg>(
  'ListingsImg',
  ListingsImgSchema
);

export default ListingsImg;
