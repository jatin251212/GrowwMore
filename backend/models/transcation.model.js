import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transactionType: {
        type: String,
        enum: ['Add Balance', 'Investment', 'Withdrawal'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
    },
    walletBalanceBefore: {
        type: Number,
        required: true,
    },
    walletBalanceAfter: {
        type: Number,
        required: true,
    },
}, { timestamps: true });  // Automatically adds `createdAt` and `updatedAt` fields

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
