import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localpath: String,
      },
      default: {
        url: `https://placehold.co/200x200`,
        localpath: "",
      },
      username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        index: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
      },
      phoneNumber: {
        type: Number,
        unique: true,
        trim: true,
      },
      password: {
        type: String,
        required: [true, "Password is required"],
      },
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      refreshToken: {
        type: String,
      },
      forgetPasswordToken: {
        type: String,
      },
      forgetPasswordExpiry: {
        type: String,
      },
      emailVerificationToken: {
        type: String,
      },
      emailVerificationExpiry: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model("user", userSchema);

// this is how the document will be stored in the database 