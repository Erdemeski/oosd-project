import mongoose from 'mongoose';

const AdvertSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['Planned', 'InProduction', 'Completed', 'OnHold'],
    default: 'Planned'
  },
  estimatedCost: { type: Number, default: 0 },
  
  // Madde 11: Yayın Planı
  schedules: [{
    channel: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    cost: { type: Number }
  }],

  createdDate: { type: Date, default: Date.now }
});

export default mongoose.model('Advert', AdvertSchema);