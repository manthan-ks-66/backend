import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Server is running on port number ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection failed\n");
    console.log(error);
  });
