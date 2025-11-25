import mongoose from "mongoose";

const AdvertSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    platform: {
        type: String,
        trim: true
    },
    estimatedCost: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    actualCost: {
        type: Number,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ['planned', 'in-progress', 'completed', 'cancelled'],
        default: 'planned'
    }
}, {
    timestamps: true
});

export default mongoose.model('Advert', AdvertSchema);

