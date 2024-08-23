import mongoose, {Document, Schema } from "mongoose";

export interface IComment {
  text: string;
  user: mongoose.Schema.Types.ObjectId;
}

export interface IPost extends Document {
  user: mongoose.Schema.Types.ObjectId;
  text?: string;
  img?: string;
  likes: mongoose.Schema.Types.ObjectId[];
  comments: IComment[];
}
const postSchema: Schema<IPost> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
  },
  img: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      text: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
},{timestamps:true});

const Post = mongoose.model<IPost>("Post", postSchema);
export default Post