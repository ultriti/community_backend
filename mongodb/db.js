const mongoose = require('mongoose');

function connectToDb(){
    try {
        mongoose.connect(process.env.DB_CONNECT).then(console.log('connected to database')).catch(err => console.log('-->',err));
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectToDb;