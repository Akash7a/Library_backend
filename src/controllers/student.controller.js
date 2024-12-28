import { Students } from "../models/student.model.js";
import { Admin } from "../models/admin.model.js";

const addStudent = async (req, res) => {
    try {
        const { name, address, mobile, entryDate, subscriptionEndDate, shift, reservedSeat, isSubscriptionActive } = req.body;

        const adminId = req.admin?._id;

        if (!adminId) {
            return res.status(403).json({ message: "Unauthorized: Admin ID not found." });
        }

        if (!name || !address || !mobile || !entryDate || !subscriptionEndDate || !shift) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        const newStudent = new Students({
            admin: adminId,
            name,
            address,
            mobile,
            entryDate,
            subscriptionEndDate,
            shift,
            reservedSeat: reservedSeat || false,
            isSubscriptionActive: isSubscriptionActive ?? true,
        });

        await newStudent.save();

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        admin.myStudents.push(newStudent._id);
        await admin.save();

        return res.status(201).json({
            student: newStudent,
            message: "Student added successfully and linked to admin.",
        });
    } catch (error) {
        console.error("Error adding student:", error);
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
};

const getStudents = async (req, res) => {
    try {
        const adminId = req.admin?._id;

        if (!adminId) {
            return res.status(403).json({ message: "Unauthorized: Admin ID not found" });
        }

        const admin = await Admin.findById(adminId).populate("myStudents");

        if (!admin || !admin.myStudents) {
            return res.status(401).json({ message: "No Students found." });
        }

        return res.status(200).json({
            myStudents: admin.myStudents,
            message: "Students fetched successfully"
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

const deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            res.status(403).json({ message: "Student ID not found" });
        }

        const deletedStudent = await Students.findByIdAndDelete(studentId);

        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200)
            .json({
                id: studentId,
                message: "Student Deleted successfully."
            })
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

const updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            return res.status(403).json({ message: "Student ID not found." });
        }

        const updateData = req.body;

        if (!updateData) {
            return res.status(400).json({ message: "No data provided for updating." });
        }


        const updatedStudent = await Students.findByIdAndUpdate(
            studentId,
            { $set: updateData },
            { new: true, runValidators: true }
        )

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found." });
        }

        return res.status(200).json({
            student: updatedStudent,
            message: "Student updated successfully.",
        })
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}

export {
    getStudents,
    addStudent,
    deleteStudent,
    updateStudent,
}