import { Admin } from "../models/admin.model.js";

const options = {
    httpOnly: true,
    secure: false // process.env.NODE_ENV === "production",
};

const registerAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if ([username, email, password].some((incomingDetails) => !incomingDetails)) {
            return res.status(400).json({ message: "Username, Email, and Password are required." });
        }

        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists with email or username." });
        }

        const newAdmin = new Admin({
            username,
            email,
            password,
        });

        await newAdmin.save();

        const token = await newAdmin.generateToken();
        return res
            .cookie("token", token, options)
            .status(201)
            .json({
                admin: newAdmin,
                token: token,
                message: "Admin registered successfully.",
            });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        if (!usernameOrEmail || !password) {
            return res.status(400).json({ message: "Username/Email and Password are required." });
        }

        const admin = await Admin.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });

        if (!admin) {
            return res.status(401).json({ message: "Invalid email/username or password" });
        }

        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email/username or password" });
        }

        const token = await admin.generateToken();

        return res
            .cookie("token", token, options)
            .status(200)
            .json({
                admin: admin,
                token: token,
                message: "Admin logged in successfully.",
            });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const adminProfile = async (req, res) => {
    try {
        const adminId = req.admin?._id;

        if (!adminId) {
            return res.status(403).json({ message: "Unauthorized: Admin ID not found." });
        }

        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        return res.status(200).json({
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                myStudents: admin.myStudents,
            },
            message: "Admin profile fetched successfully."
        });
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        return res.status(500).json({ message: "Internal Server Error.", error: error.message });
    }
}
const adminLogout = async (req, res) => {
    try {
        res.clearCookie("token", options);

        return res.status(200).json({ message: "Admin logged out successfully." });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

export {
    registerAdmin,
    loginAdmin,
    adminLogout,
    adminProfile,
};