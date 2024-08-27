
export interface IUser {
    _id: string; // MongoDB ObjectId as a string
    username: string;
    fullname: string;
    password: string; // Sensitive data usually shouldn't be in responses; consider excluding it if it's not needed
    email: string;
    followers: string[]; // Array of ObjectId references as strings
    following: string[]; // Array of ObjectId references as strings
    profileImg?: string; // Optional field
    coverImg?: string; // Optional field
    bio?: string; // Optional field
    link?: string; // Optional field
    likedPosts?: string[]; // Array of ObjectId references as strings
  }