// models/InvestmentOrder.js
import mongoose from 'mongoose';

const investmentOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    investedAmount: {
        type: Number,
        required: true,
    },
    returnGenerated: {
        type: Number,
        default: 0,
    },
    orderId: {
        type: String,
        unique: true,
    },
    investmentDate: {
        type: Date,
        default: Date.now,
    },
    isExited: {
        type: Boolean,
        default: false,
    },
});

const InvestmentOrder = mongoose.model('InvestmentOrder', investmentOrderSchema);


export default InvestmentOrder;
