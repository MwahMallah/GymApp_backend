const mongoose = require('mongoose');

const foodScheme = new mongoose.Schema({
    name: {type: String, required: true},
    calories: {type: Number},
    date: {type: Date},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

foodScheme.set('toJSON', {
    transform: (document, returnValue) => {
        returnValue.id = document._id;
        delete returnValue._id;
        delete returnValue.__v;
    }
});

module.exports = mongoose.model('Food', foodScheme);