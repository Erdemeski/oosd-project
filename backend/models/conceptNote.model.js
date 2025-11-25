import mongoose from "mongoose";

const ConceptNoteSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdByStaffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model('ConceptNote', ConceptNoteSchema);

