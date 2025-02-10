import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';


export const register = async (req, res) => {
    try {
        const {fullName, userName, phoneNumber, password, confirmPassword, dob, gender, referralCode, termsAccepted } = req.body;

        // Validate all required fields
        if (!fullName ||!userName || !phoneNumber || !password || !confirmPassword || !dob || !gender || !termsAccepted ) {
            return res.status(400).json({
                message: "Please fill all required fields and accept the terms and conditions",
                success: false
            });
        }

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
                success: false
            });
        }

        const phoneRegex = /^[0-9]{10}$/; // Example: Only 10-digit phone numbers allowed
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                message: "Invalid phone number format",
                success: false
            });
        }


        // Check if the user with the same email or mobile already exists
        const user = await User.findOne({
            $or: [{ phoneNumber }, { userName }]
        });
        if (user) {
            return res.status(400).json({
                message: "User with this mobile number already exists",
                success: false
            });
        }

          // Validate the referral code if provided
        let referringUser = null;
        if (referralCode) {
            referringUser = await User.findOne({ personalReferralCode: referralCode }).select('userName');
            if (!referringUser) {
                return res.status(400).json({
                    message: "Invalid referral code",
                    success: false
                });
            }
            // console.log(referringUser.userName);
        }
        // console.log(referringUser);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

         // Generate a referral code using the username and UUID
         const usernamePart = userName.substring(0, 4   ); // First 6 characters of the username
         const randomUuid = uuidv4().replace(/-/g, '').substring(0, 12); // Get first 12 characters without dashes
         const userReferralCode = `${usernamePart}-${randomUuid}`; // Concatenate username and UUID part
 

        // Create a new user
        const newUser = await User.create({
            fullName,
            userName,
            phoneNumber,  
            dob,
            password: hashedPassword,
            gender,
            referralCode: referralCode || null, // Optional referral code
            referredBy: referralCode ? referringUser?.userName : null, // Set referredBy only if referralCode is provided and valid
            personalReferralCode: userReferralCode // Store the generated referral code
            
        });

        // Generate a JWT token for the user
        const token = jwt.sign({ id: newUser._id, phoneNumber: newUser.phoneNumber}, process.env.JWT_SECRET, {
            expiresIn: '1d' // Token expires in 1 day
        });

        return res.status(201).json({
            message: "Account created successfully",
            success: true,
            token // Return the JWT token in the response
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const login= async (req, res) => {
    try {
        const {userIdentifier,password}=req.body;

        if(!userIdentifier|| !password){
            return res.status(400).json({
                message:"Please fill all required fields",
                success:false
            });
        };


        const user = await User.findOne({
            $or: [{ userName: userIdentifier }, { phoneNumber: userIdentifier }]
          });
        // console.log(user);
          if (!user) {
            return res.status(401).json({ error: 'Invalid username or phone number' });
          }
        
          // Compare the provided password with the stored hashed password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
          }

          const tokenData={
            userId:user._id
        }
        const token= jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).cookie('token',token,{maxAge:1*24*60*60*1000, httpsOnly:true, sameSite:'strict'}).json({
            message:`Welcome, ${user.fullName}`,
            token,
            success:true
        })

    
    } catch (error) {
        console.log(error);
        
    }
}

export const logout= async (req, res) => {
    try {
        return res.status(200).cookie('token',"",{maxAge:0}).json({
            message:"Logged out Successfully",
            success:true
        })
        
    } catch (error) {
        console.log(error);
    }
}



