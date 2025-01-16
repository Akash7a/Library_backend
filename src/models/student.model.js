import mongoose from "mongoose";
import jwt from  "jsonwebtoken";
import bcrypt from "bcrypt";

const studentSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
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
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid email!`,
            },
        },
        password:{
            type:String,
            required:true,
            minlength:6,
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
            enum: ["morning", "evening","afternoon"],
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
        remainingDays: {
            type: Number,
            default: 0,
        },
        attendance: [
            {
                date: {
                    type: Date,
                    required: true,
                    default: Date.now,
                },
                present: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

studentSchema.pre("save", function (next) {
    if (this.subscriptionEndDate) {
        const today = new Date();
        const endDate = new Date(this.subscriptionEndDate);
        const timeDiff = endDate - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        this.remainingDays = daysLeft > 0 ? daysLeft : 0;
    }
    next();
});

studentSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
});

studentSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password,this.password);
}
studentSchema.methods.genrateToken = async function(){
    return jwt.sign(
        {_id:this._id,name:this.name},
        process.env.TOKEN_SECRET,
        {
            expiresIn:"7d",
        }
    );
}

studentSchema.methods.markAttendance = async function () {
    const today = new Date();
    const existingAttendance = this.attendance.find(attendance => attendance.date.toDateString() === today.toDateString());

    if (existingAttendance) {
        existingAttendance.present = !existingAttendance.present;
    } else {
        this.attendance.push({ date: today, present: true });
    }

    this.remainingDays = this.remainingDays - 1;
    await this.save();
    return this;
};

export const Students = mongoose.model("Students", studentSchema);