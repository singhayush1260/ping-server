import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;