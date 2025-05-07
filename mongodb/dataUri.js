const DataUriParser = require('datauri/parser.js');
const path = require('path');


const parser = new DataUriParser();

module.exports.getDataUri = async (file) => {
    const extname = path.extname(file.orignalname).toString();
    return parser.format(extname,file.buffer).content;
};