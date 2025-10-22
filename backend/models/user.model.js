import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    staffId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isCreativeStaff: {
        type: Boolean,
        default: false,
    },
    isAccountant: {
        type: Boolean,
        default: false,
    },
    isManager: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;