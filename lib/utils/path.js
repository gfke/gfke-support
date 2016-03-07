var path = require("path");

var log = require("debug")("gfke-support:utils:path");

exports.isAbsolute = function(p) {
    return path.normalize(p + '/') === path.normalize(path.resolve(p) + '/');
};
