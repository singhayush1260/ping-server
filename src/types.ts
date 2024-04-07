import { Document } from "mongoose";

export interface User extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
  about?: string;
  location?: {
    name: string;
    center: number[]; // Array of [longitude, latitude]
  };
  connections?: User[];
  chats?: Chat[];
  createdAt: any;
}

export interface Chat extends Document {
  name: string;
  isGroup: boolean;
  thumbnail?: string;
  lastMessage?: Message | null;
  messages: Message[];
  users: User[];
  admin: User | null;
  createdAt: any;
}

export interface Message extends Document {
  body?: string;
  image?: string;
  chat: Chat;
  sender?: User;
  seenIds: User[];
}

export interface ConnectionRequest extends Document {
  sender: User;
  receiver: User;
  status: "pending" | "accepted" | "declined";
}
