import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

dotenv.config({
    path: "../.env",
});

// Check if the environment is production or development
const allowedOrigins = [
    "http://localhost:5173", // Local development
    "https://library-app-frontend-m1sw.onrender.com", // Netlify frontend
];

app.use(cors({
    origin: function(origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

import { adminRouter } from "./routes/admin.route.js";
import { studentRouter } from "./routes/student.route.js";
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/student", studentRouter);

export { app };