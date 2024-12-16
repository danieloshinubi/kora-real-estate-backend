import mongoose, { Document, Model, Schema } from 'mongoose';
import ROLES_LIST from '../config/roles_list';

export interface IUser extends Document {
  email: string;
  password: string;
  phoneNo: string;
  roles: {
    User: number;
    Admin?: number;
  };
  otp: string | null;
  isVerified: boolean;
  accountDisabled: boolean;
}

const userSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    roles: {
      User: {
        type: Number,
        default: ROLES_LIST.User,
      },
      Admin: Number,
      Group_Admin: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    accountDisabled: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Middleware to clear OTP after 2 minutes
userSchema.post<IUser>('save', function (doc) {
  if (doc.otp) {
    setTimeout(
      async () => {
        try {
          await mongoose
            .model<IUser>('User')
            .findByIdAndUpdate(doc._id, { otp: null });
        } catch (error) {
          console.error('Error updating otp expiration:', error);
        }
      },
      2 * 60 * 1000
    );
  }
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
