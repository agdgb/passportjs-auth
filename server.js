const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoute");
const roleRoutes = require("./routes/roleRoutes");
const userRolesRoutes = require("./routes/userRolesRoutes");

require("dotenv").config();

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

app.use(bodyParser.json());

mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const corsOptions = {
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(passport.initialize());
require("./config/passport")(passport);

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/userroles", userRolesRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
