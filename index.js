// Core dependencies
const express = require("express");
const path = require("path");
const http = require("http");
const {Server} = require("socket.io");

const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config(); // Load environment variables


// App initialization
const app = express();
const port = process.env.PORT || 3000;


// MongoDB connection function
const connectMongoDb = require("./connection"); 
const intiSocket = require("./socket");
const server = http.createServer(app);

// socket connection
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

intiSocket(io);


// Middlewares
const { logReqRes, checkAuthentication, restrictTo } = require("./middleware"); // Logging, authentication, role restriction
const isError = require("./middleware/error"); // Centralized error handler


// Routers
const userRouter = require("./routes/user");
const projectRouter = require("./routes/project");
const bugRouter = require("./routes/bug");


// View engine setup (EJS for rendering HTML templates)
app.set("view engine", "ejs");
app.set("views", path.resolve("./view"));


// Middleware for parsing request bodies and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Log all requests/responses to a log file
app.use(logReqRes("log.txt"));



// Connect to MongoDB
connectMongoDb("mongodb://127.0.0.1:27017/Kanban-Collab")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));



// Public and protected routes
app.use("/user", userRouter); // Signup/Login/Logout routes
app.use("/project",checkAuthentication,projectRouter);
app.use("/bug",checkAuthentication,bugRouter);

// Error-handling middleware (should always be at the end)
app.use(isError);


// Start the server
app.listen(port, () => console.log(`Server started on port ${port}`));
