var fs = require('fs');
var str = fs.readFileSync('./biblio.json', 'utf8');
var json = JSON.parse(str);

function _copyProps(src, dest) {
    for (var k in src) {
        dest[k] = src[k];
    }
}

function _cloneJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function Bibref(raw) {
    this.raw = raw;
    this.all = expandRefs(raw);
}

function expandRefs(refs) {
    refs = _cloneJSON(refs);
    Object.keys(refs).forEach(function(ref) {
        var previousVersions = refs[ref].previousVersions
        if (previousVersions) {
            delete refs[ref].previousVersions;
            Object.keys(previousVersions).forEach(function(subRef) {
                var previousVersion = previousVersions[subRef];
                if (previousVersion.aliasOf) {
                    refs[ref + '-' + subRef] = previousVersion;
                } else {
                    var obj = {};
                    _copyProps(refs[ref], obj);
                    _copyProps(previousVersions[subRef], obj);
                    refs[ref + '-' + subRef] = obj;
                }
            });
        }
    });
    return refs;
}

Bibref.prototype.get = get;
function get(ref, output) {
    output = output || {};
    var obj;
    do {
        obj = this.all[ref];
        if (obj && !output[ref]) output[ref] = obj;
    } while (obj && (ref = obj.aliasOf))
    return output;
}

Bibref.prototype.getRefs = getRefs;
function getRefs(refs) {
    var output = {};
    refs.forEach(function(ref) { this.get(ref, output); }, this);
    return output;
}

module.exports = new Bibref(json);
module.exports.create = function(obj) {
    return new Bibref(obj);
};
module.exports.expandRefs = expandRefs;