import mongoose from 'mongoose';

const dailyDataSchema = new mongoose.Schema({
    Name: {
        type: String,
        enum: ['gainers', 'losers'],
        required: true
    },
    data: [{
        Symbol: {
            type: String,
            required: true
        },
        Price: {
            type: Number,
            required: true
        },
        ProfitLoss: {
            type: Number,
            required: true
        },
    }]
});

const DailyData = mongoose.model('DailyData', dailyDataSchema);
export default DailyData;
