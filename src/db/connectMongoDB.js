import mongoose from "mongoose";
import dns from "node:dns";

// needed on my Windows setup as the default DNS resolver can't handle the SRV lookups used by mongodb+srv:// URLs
dns.setServers(["1.1.1.1"]);


export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ MongoDB connection established successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
