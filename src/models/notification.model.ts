import mongoose, { Document, Schema } from "mongoose"


export interface INotification extends Document {
    from :mongoose.Schema.Types.ObjectId, 
    to :mongoose.Schema.Types.ObjectId , 
    type:String , 
    read:boolean , 
}

const notificationSchema:Schema<INotification> = new Schema(
    {
from: {
    type:mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true,
},
to: {
    type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},
type:{
    type:String,
    required: true,
    enum: [ "follow" , "like"],
},
read:{
type:Boolean,
default: false
}
}, {timestamps:true}
)
const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema)

export default Notification