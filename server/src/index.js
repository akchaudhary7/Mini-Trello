import connectDB from "./db/index.js";
import { app } from "./app.js";

const port = process.env.PORT || 7777;
connectDB()
.then(() => {
  app.on("error", (error) => {
    console.log("Error: ", error);
    throw error;
  })
  app.listen(port, ()=>{
    console.log(`⚙️  Server is running at port: ${port}`);
    
  })
})
.catch((error)=>{
    console.log("MongoDB connection failed !!!", error)
})
