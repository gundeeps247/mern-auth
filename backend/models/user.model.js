import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    profilePicture:{
        type:String,
        default:"https://www.popsci.com/wp-content/uploads/2020/01/07/WMD5M52LJFBEBIHNEEABHVB6LA.jpg",
    }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;
