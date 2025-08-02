import mongoose from "mongoose";

 export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://murageshA:4PM22CS060@cluster0.y5fjuap.mongodb.net/JUST_FOODYY').then(()=>console.log("DB Connected"))
}