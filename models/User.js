const mongoose = require('mongoose');
 const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        location:{
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    });
    const UserModel = mongoose.model('user', userSchema);
    module.exports = UserModel;