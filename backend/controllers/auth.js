const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwtProvider");
const nodemailer = require("nodemailer");

// Allowed roles (you can remove this if fully dynamic)
const ALLOWED_ROLES = ["admin", "faculty", "student", "department_head", "dean"];

/* =========================
   REGISTER USER (NO OTP)
========================= */
const registerUser = async (req, res) => {
    try {
        let { firstName, lastName, email, password, role, department } = req.body;

        if (!role) role = "student"; // default role

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,          // ✅ dynamic role
            department     // ✅ stored
        });

        await user.save();

        const token = generateToken(user._id);
        user.password = null;

        res.status(200).json({
            message: "Registration successful",
            data: user,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Registration failed" });
    }
};

/* =========================
   LOGIN USER
========================= */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = generateToken(user._id);
        user.password = null;

        let redirectUrl = "/home";

        // dynamic role handling
        if (user.role === "admin") redirectUrl = "/admin";
        else if (user.role === "faculty") redirectUrl = "/faculty";
        else if (user.role === "department_head") redirectUrl = "/department";
        else if (user.role === "dean") redirectUrl = "/dean";

        res.status(200).json({
            message: "Login successful",
            data: user,
            token,
            redirectUrl
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
};

/* =========================
   OTP STORE
========================= */
const otpStore = new Map();

/* =========================
   EMAIL TRANSPORTER
   (FAST EMAIL)
========================= */
const createEmailTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: "komybire471@gmail.com",
            pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 5000,
        greetingTimeout: 3000,
        socketTimeout: 10000
    });
};

/* =========================
   GENERATE OTP
========================= */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/* =========================
   SEND OTP
========================= */
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }

        console.log(`[OTP] Starting OTP generation for: ${email}`);

        const otp = generateOTP();
        console.log(`[OTP] Generated OTP: ${otp}`);

        otpStore.set(email, {
            otp,
            expires: Date.now() + 5 * 60 * 1000
        });

        console.log(`[OTP] Creating email transporter...`);
        const transporter = createEmailTransporter();

        console.log(`[OTP] Sending email to: ${email}`);
        const startTime = Date.now();

        await transporter.sendMail({
            from: "komybire471@gmail.com",
            to: email,
            subject: "BHULink OTP Verification",
            html: `
                <h2>Your OTP Code</h2>
                <h1>${otp}</h1>
                <p>Expires in 5 minutes</p>
            `
        });

        const endTime = Date.now();
        console.log(`[OTP] Email sent successfully in ${endTime - startTime}ms`);

        res.status(200).json({ 
            message: "OTP sent successfully",
            debug: {
                email: email,
                otp: otp, // Only for testing - remove in production
                time: `${endTime - startTime}ms`
            }
        });

    } catch (error) {
        console.error(`[OTP ERROR] ${error.message}`);
        console.error(`[OTP ERROR] Code: ${error.code}`);
        console.error(`[OTP ERROR] Stack: ${error.stack}`);
        
        res.status(500).json({ 
            message: "Failed to send OTP",
            error: error.message,
            code: error.code
        });
    }
};

/* =========================
   VERIFY OTP + CREATE USER
========================= */
const verifyOTP = async (req, res) => {
    try {
        const { email, otp, userData } = req.body;

        const stored = otpStore.get(email);

        if (!stored) {
            return res.status(400).json({ message: "OTP not found" });
        }

        if (Date.now() > stored.expires) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP expired" });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        let { firstName, lastName, password, role, department } = userData;

        if (!role) role = "student";

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,         // ✅ dynamic role
            department    // ✅ stored
        });

        await user.save();

        const token = generateToken(user._id);
        user.password = null;

        otpStore.delete(email);

        res.status(200).json({
            message: "Account created successfully",
            data: user,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "OTP verification failed" });
    }
};

/* =========================
   EXPORT
========================= */
module.exports = {
    registerUser,
    loginUser,
    sendOTP,
    verifyOTP
};