// models/DailyReturn.js
import mongoose from 'mongoose';

const dailyReturnSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    overallReturn: {
        type: Number,
        required: true,
    },
    todaysReturn: {
        type: Number,
        required: true,
    },
});

const DailyReturn = mongoose.model('DailyReturn', dailyReturnSchema);


export default DailyReturn;
