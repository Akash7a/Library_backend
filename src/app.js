import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();
 
dotenv.config({
    path: "../.env",
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

import { adminRouter } from "./routes/admin.route.js";
import { studentRouter } from "./routes/student.route.js";
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/student",studentRouter);

export {
    app
}