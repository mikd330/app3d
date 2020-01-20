var fs = require('fs');
function getBase64(path) {
    var imageAsBase64 = fs.readFileSync(path, 'base64');
    return imageAsBase64;
}