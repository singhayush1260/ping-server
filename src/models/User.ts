import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default:"http://res.cloudinary.com/dgebufhgh/image/upload/v1712085702/dkc6jmrcgumaiw8j6ezu.jpg"
  },
  about: {
    type: String,
    default:"Hello everyone"
  },
  location: {
    name:{
      type:String
    },
    center: {
      type: [Number], // Array of numbers [longitude, latitude]
    },
  },
  connections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
},
{
  timestamps: true,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
