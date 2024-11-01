const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, minLength: 3, unique: true},
    name: {type: String},
    passwordHash: {type: String},
    blogs: [{type: mongoose.Schema.Types.ObjectId, ref: "Blog"}]
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