import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";

const authenticateAdmin = async (req, res, next) => {
    try {

        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request, token missing." });
        }

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        const admin = await Admin.findById(decoded._id);

        if (!admin) {
            return res.status(401).json({ message: "Unauthorized request, admin not found." });
        }

        req.admin = admin;

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired, please log in again." });
        }
        res.status(403).json({ message: "Invalid or expired token." });
    }
}

export { authenticateAdmin };