import mongoose from "mongoose";
const conn= async(dbname)=>{
    try{
        const res=await mongoose.connect(`mongodb+srv://onkarbhojane22:Onkar%401234@cluster0.rdojecr.mongodb.net/Stock?retryWrites=true&w=majority&appName=Cluster0`);
        if(res){
            console.log("connected to DB")
        }else{
            console.log("connection failed ");
        }
    }catch(error){
        console.log("connection error....",error)
    }
}

export default conn;