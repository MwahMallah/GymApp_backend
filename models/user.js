const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, minLength: 3, unique: true},
    name: {type: String},
    exercises: [{type: mongoose.Schema.Types.ObjectId, ref: "Exercise"}],
    food: [{type: mongoose.Schema.Types.ObjectId, ref: "Food"}],
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