const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoute");
const roleRoutes = require("./routes/roleRoutes");
const userRolesRoutes = require("./routes/userRolesRoutes");

require("dotenv").config();

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(passport.initialize());
require("./config/passport")(passport);

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/userroles", userRolesRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
