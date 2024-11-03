const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {type: String, required: true},
    sets: [ 
        {
            weight: {type: Number, required: true},
            reps: {type: Number, required: true},
            isCompleted: {type: Boolean, default: false},
        }
    ],
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