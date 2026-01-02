const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const config = require("./config");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes")

const app = express();

// ✅ Middlewares
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

app.use(express.json());

app.use("/api/cart", cartRoutes);
//Routes
app.use("/api/auth", authRoutes);

console.log("Product routes loaded");
app.use("/api/products", productRoutes);
//Order Routes
app.use("/api/orders", orderRoutes)

//Test route
app.get("/", (req, res) => {
  res.send("API running successfully");
});

//START SERVER ONLY AFTER DB CONNECTS
const startServer = async () => {
  try {
    await connectDB(); 
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
