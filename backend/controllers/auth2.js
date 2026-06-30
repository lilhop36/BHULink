const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwtProvider");

/* =========================
   REGISTER USER
   DIRECT SAVE (NO OTP)
========================= */
const registerUser = async (req, res) => {
    try {
        console.log('🔥 Auth2 register request received');
        console.log('📝 Request body:', req.body);

        let {
            firstName,
            lastName,
            email,
            password,
            role,
            department
        } = req.body;

        console.log('✅ Extracted fields:', { firstName, lastName, email, role, department });

        // Default role if not provided
        if (!role) {
            role = "student";
        }

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            console.log('❌ Validation failed: missing required fields');
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        // Check existing user
        console.log('🔍 Checking for existing user with email:', email);
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('❌ User already exists:', existingUser.email);
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Create new user
        console.log('👤 Creating new user...');
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            department
        });

        // Save directly to database
        console.log('💾 Saving user to database...');
        await user.save();
        console.log('✅ User saved successfully:', user._id);

        // Generate token
        const token = generateToken(user._id);

        // Remove password from response
        const responseUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            department: user.department
        };

        console.log('🎉 Sending success response');
        return res.status(201).json({
            message: "User registered successfully",
            data: responseUser,
            token
        });

    } catch (error) {
        console.error("❌ Register Error:", error);

        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

/* =========================
   EXPORT
========================= */
module.exports = {
    registerUser
};
