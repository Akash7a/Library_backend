import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
        },
        date: {
            type: String,
            required: true,
        }
    },
    {
        timestamps:true
    }
)

export const Attendance = mongoose.model("Attendance",attendanceSchema);