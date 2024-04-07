import mongoose, { Schema } from "mongoose";
const messageSchema = new Schema(
  {
    body: {
      type: String,
    },
    image: {
      type: String,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required:true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    seenIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      }
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;