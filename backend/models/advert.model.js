import mongoose from "mongoose";

const AdvertSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    createdByStaffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
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
    // Feat dalından gelen genel platform bilgisi (Örn: TV, Sosyal Medya)
    platform: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        // Main ve Feat enum değerlerinin birleşimi (Standardize edildi: Title Case)
        enum: ['Planned', 'InProduction', 'Completed', 'OnHold', 'Cancelled'],
        default: 'Planned'
    },
    estimatedCost: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    // Feat dalından gelen "Gerçekleşen Maliyet" alanı
    actualCost: {
        type: Number,
        min: 0,
        default: 0
    },
    // Main dalından gelen detaylı Yayın Planı yapısı (Madde 11)
    schedules: [{
        channel: { 
            type: String, 
            required: true,
            trim: true
        },
        startDate: { 
            type: Date, 
            required: true 
        },
        endDate: { 
            type: Date, 
            required: true 
        },
        cost: { 
            type: Number,
            min: 0,
            default: 0 
        }
    }]
}, {
    timestamps: true // createdDate yerine Mongoose'un otomatik zaman damgaları
});

export default mongoose.model('Advert', AdvertSchema);