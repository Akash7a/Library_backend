import { Router } from "express";
import {authenticateAdmin} from "../middleware/verifyJWT.js";

import{
    registerAdmin,
    loginAdmin,
    adminLogout,
    adminProfile,
} 
from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin);
adminRouter.route("/logout").get(authenticateAdmin,adminLogout);
adminRouter.route("/getProfile").get(authenticateAdmin,adminProfile);

export {
    adminRouter
}