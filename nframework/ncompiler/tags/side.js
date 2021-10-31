const Tag = require('../tag/tag');

let tag = new Tag();

tag.isAutoClose = true;

tag.Compile = function(element, childsCode, code) {
    let inputs = tag.GetInputs(element, childsCode, code);
    return `this.side='${inputs[0]}';`;
}


module.exports = tag;
