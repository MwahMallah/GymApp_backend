const mongoose = require('mongoose');

const messageScheme = new mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, required: true},
    time: {type: String},
    content: {type: String, required: true},
    seen: {type: Boolean, default: false}
});

messageScheme.set('toJSON', {
    transform: (document, returnValue) => {
        returnValue.id = document._id;
        delete returnValue._id;
        delete returnValue.__v;
    }
});

module.exports = mongoose.model('Message', messageScheme);