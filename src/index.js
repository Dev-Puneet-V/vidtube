import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT || 7000;
connectDB()
  .then()
  .catch((err) => {
    console.log("Mongodb connection error ", err);
  });

app.listen(PORT, () => {
  console.log(`Service is running on port ${PORT}`);
});

export { app };