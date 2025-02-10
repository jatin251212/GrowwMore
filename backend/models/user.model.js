// models/User.js
import  mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    
    walletBalance: {
        type: Number,
        default: 0,
    },
    referralCode: {
        type: String,
        default: null
    },
    referredBy: {
        type: String,
        default: null,
    },
    personalReferralCode: { 
        type: String,
        unique: true 
    },
         
    dob: { 
        type: Date,
        required: true
    },
    gender: { 
        type: String,
        enum: ['Male', 'Female'],
        required: true, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},{ timestamps: true });



const User = mongoose.model('User', userSchema);

export default User; // Export using ES Modules