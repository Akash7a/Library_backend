import { Router } from "express";
import { authenticateAdmin } from "../middleware/verifyJWT.js"
import {
    getStudents,
    addStudent,
    deleteStudent,
    updateStudent,
}
    from "../controllers/student.controller.js";

const studentRouter = Router();

studentRouter.route("/getStudents").get(authenticateAdmin, getStudents);
studentRouter.route("/addNewStudent").post(authenticateAdmin, addStudent);
studentRouter.route("/delete/:studentId").delete(authenticateAdmin, deleteStudent);
studentRouter.route("/update/:studentId").put(authenticateAdmin,updateStudent);

export {
    studentRouter
}