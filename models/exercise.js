const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {type: String, required: true},
    reps: {type: Number},
    date: {type: Date},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

exerciseSchema.set('toJSON', {
    transform: (document, returnValue) => {
        returnValue.id = document._id;
        delete returnValue._id;
        delete returnValue.__v;
    }
});

module.exports = mongoose.model('Exercise', exerciseSchema);