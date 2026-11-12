import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/database";
import apiRoutes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Connect to MongoDB before starting the server
(async () => {
  await connectToDatabase();
  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }
})();

export default app;
