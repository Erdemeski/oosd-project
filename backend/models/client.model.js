import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    surname:{
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    address:{
        type: String,
        trim: true,
    },
    contactPersonDetails:{
        type: String,
        trim: true,
    },
    companyName:{
        type: String,
        trim: true,
        maxLength: 200
    },
    email:{
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },

},  { 
        timestamps: true 
    }
);

export default mongoose.model('Client', ClientSchema);