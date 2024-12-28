import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        admin:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },
        name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        },
        entryDate: {
            type: Date,
            required: true,
        },
        subscriptionEndDate: {
            type: Date,
            required: true,
        },
        shift: {
            type: String,
            enum: ["morning", "evening"],
            required: true,
        },
        reservedSeat: {
            type: Boolean,
            default: false,
        },
        isSubscriptionActive: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Students = mongoose.model("Students", studentSchema);