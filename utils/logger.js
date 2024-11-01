function info(...msg) {
    if (process.env.NODE_ENV === 'test') { 
        console.log(...msg)
    }
}

function error(...msg) {
    if (process.env.NODE_ENV === 'test') { 
        console.error(...msg);
    }
}

module.exports = {info, error};