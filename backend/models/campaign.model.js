import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
    clientId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    title:{
        type: String,
        required: true,
        trim: true,
    },
    plannedStartDate:{
        type: Date,
    },
    plannedEndDate:{
        type: Date,
    },
    estimatedCost: {
        type: Number,
        required: true,
        min: 0
    },
    budget: {
        type: Number,
        required: true,
        min: 0
    },
    assignedCreativeStaff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    assignedAccountant: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
})

export default mongoose.model('Campaign', CampaignSchema);