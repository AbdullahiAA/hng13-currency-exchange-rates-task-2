const dotenv = require("dotenv");
const express = require("express");
const app = express();
const db = require("./models");

// Load environment variables
dotenv.config();

// Middlewares
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const PORT = process.env.PORT || 3000;

// Routes
const countryRoutes = require("./routes/country.routes");
const CountryController = require("./controllers/country.controller");

// Apply middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use("/countries", countryRoutes);

app.get("/status", CountryController.getStatus);

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Sync database
db.sequelize
  .sync()
  .then(() => {
    console.log("✅ Database synced");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => console.error("❌ Sync failed:", err));
