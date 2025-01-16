import { Students } from "../models/student.model.js";
import { Admin } from "../models/admin.model.js"; 
import {sendEmail} from "../utils/sendEmail.js";

const addStudent = async (req, res) => {
    try {
        const { name, address, mobile, entryDate, subscriptionEndDate, shift, reservedSeat, isSubscriptionActive,email,password} = req.body;

        const adminId = req.admin?._id;

        if (!adminId) {
            return res.status(403).json({ message: "Unauthorized: Admin ID not found." });
        }

        if (!name || !address || !mobile || !entryDate || !subscriptionEndDate || !shift || !email || !password) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        const newStudent = new Students({
            admin: adminId,
            name,
            address,
            mobile,
            email,
            password,
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

        const emailText = `Welcome ${name},\n\nYour login details are:\nEmail:${email}\nPassword:${password}`;
        await sendEmail(email,'Your Login Details',emailText);

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
            return res.status(403).json({ message: "Student ID not found" });
        }

        // Find and delete the student
        const deletedStudent = await Students.findByIdAndDelete(studentId);

        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Remove the student ID from the admin's myStudents array
        const adminId = deletedStudent.admin; // Assuming the student document has a reference to admin
        await Admin.findByIdAndUpdate(adminId, {
            $pull: { myStudents: studentId },
        });

        return res.status(200).json({
            id: studentId,
            message: "Student deleted successfully and removed from admin's list.",
        });
    } catch (error) {
        console.error("Error deleting student:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

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

        if (updateData.subscriptionEndDate) {
            const today = new Date();
            const endDate = new Date(updateData.subscriptionEndDate);
            const timeDiff = endDate - today;
            const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            updateData.remainingDays = remainingDays > 0 ? remainingDays : 0;
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

const markStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Students.findById(studentId);

        if (!student) {
            return res.status(400).json({ message: "Student Not found" });
        }

        const updatedStudent = await student.markAttendance();

        return res.status(200).json({
            message: "Attendance marked successfully.",
            student: updatedStudent,
        });
    } catch (error) {
        return res.status(500).json({ message: "Error marking attendance", error: error.message });
    }
};

const showStudentAttendance = async (req, res) => {
    try {
      const { studentId } = req.params;
  
      if (!studentId) {
        return res.status(400).json({ message: "Student ID not found" });
      }
  
      const student = await Students.findById(studentId).populate("attendance");
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      return res.status(200).json({
        student: student,
        message: "Attendance fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching attendance:", error); // Log the error for debugging
      return res.status(500).json({ message: "Error fetching attendance", error: error.message });
    }
  };

export {
    getStudents,
    addStudent,
    deleteStudent,
    updateStudent,
    markStudentAttendance,
    showStudentAttendance,
}