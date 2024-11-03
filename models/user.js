const mongoose = require('mongoose');

const default_photo_url = "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3408.jpg?semt=ais_hybrid";

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, minLength: 3, unique: true},
    name: {type: String},
    exercises: [{type: mongoose.Schema.Types.ObjectId, ref: "Exercise"}],
    food: [{type: mongoose.Schema.Types.ObjectId, ref: "Food"}],
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    photo_url: {type: String, default: default_photo_url},
    passwordHash: {type: String},
});

userSchema.set('toJSON', {
    transform: (document, returnValue) => {
        returnValue.id = document._id;
        delete returnValue._id;
        delete returnValue.__v;
        delete returnValue.passwordHash;
    }
})

module.exports = mongoose.model('User', userSchema);