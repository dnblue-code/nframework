const fs = require('fs');
const Element = require('./element/element');

class NCompiler {
    constructor() {}

    CreateModuleFromCode(codeSV, codeCL, path) {
        let fileNLCPath = path;
        let dirNLCPath = '';
        let fileNLCName = '';
        let fileJSNameSV = '';
        let fileJSSVPath = path;

        let fileJSNameC = '';
        let fileJSCPath = path;

        let endDIndex = 0;
        for (let i = path.length - 1; i >= 0; i--) {
            if (path[i] == '\\' || path[i] == '/') {
                endDIndex = i;
                break;
            }
        }

        dirNLCPath = fileNLCPath.substring(0, endDIndex);

        fileNLCName = fileNLCPath.substring(endDIndex + 1, path.length);

        fileJSNameSV = fileNLCName + '.server.js';

        fileJSSVPath = dirNLCPath + '/' + fileJSNameSV;

        fileJSNameC = fileNLCName + '.client.js';

        fileJSCPath = dirNLCPath + '/' + fileJSNameC;

        let prs_fileJSCPath = '';

        for (let i = 0; i < fileJSCPath.length; i++) {
            if (fileJSCPath[i] == '\\') {
                prs_fileJSCPath += '\\';
            }
            prs_fileJSCPath += fileJSCPath[i];
        }

        codeSV = 'const JSCLPath = "' + prs_fileJSCPath + '";\n' + codeSV;

        fs.writeFileSync(fileJSSVPath, codeSV);
        fs.writeFileSync(fileJSCPath, codeCL);

        let cResult = new Object();

        cResult.codeSV = codeSV;

        cResult.codeCL = codeCL;

        cResult.fileNLCPath = fileNLCPath;
        cResult.dirNLCPath = dirNLCPath;
        cResult.fileNLCName = fileNLCName;
        cResult.fileJSNameSV = fileJSNameSV;
        cResult.fileJSSVPath = fileJSSVPath;
        cResult.fileJSNameC = fileJSNameC;
        cResult.fileJSCPath = fileJSCPath;

        return cResult;
    }


    GetTag(name) {
        let result = null;

        let useNone = function() {
            result = require('./tags/none_tag.js');
            result.name = name;
        }

        if (name != '') {
            if (fs.existsSync(__dirname + '/tags/' + name + '.js')) {
                result = require('./tags/' + name + '.js');
                result.name = name;
                return result;
            } else {
                let isExists = false;
                for (let base of this.useBases) {
                    let basePath = this.GetTagNameFromString(base.name);
                    let basePath2 = '';
                    for (let i = 0; i < basePath.length; i++) {
                        let ch = '/'
                        if (basePath[i] != ':') {
                            ch = basePath[i];
                        }
                        basePath2 += ch;
                    }
                    basePath = basePath2;
                    let fullPath = __dirname + '/tags/' + basePath + '/' + name + '.js';
                    if (fs.existsSync(fullPath)) {
                        result = require(fullPath);
                        result.name = name;
                        isExists = true;
                        return result;
                    }
                }
                useNone();
            }
        } else {
            result = require('./tags/region.js');
            result.name = name;
        }
        return result;
    }

    IsStartTag(index, code) {
        let result = true;
        for (let i = index + 1; i < code.length; i++) {
            let ch = code[i];
            if (ch == '|') {
                result = false;
                break;
            } else
            if (ch == '>' || ch == '/') {
                break;
            }
        }
        return result;
    }

    GetTagNameFromString(code) {
        let input = code;
        let inputr = '';
        let regex = /^[a-zA-Z]+$/;
        let j = 0;
        let start = 0;
        let end = 0;

        for (; j < input.length; j++) {
            if (input[j] != ' ') {
                start = j;
                break;
            }
        }

        for (j = input.length - 1; j >= start; j--) {
            if (input[j] != ' ' && input[j] != '\n' && input[j] != '\r') {
                end = j;
                break;
            }
        }
        inputr = input.substring(start, end + 1);

        return inputr;
    }

    ClearSpace(name) {
        let start = 0;
        let end = name.length - 1;

        for (let i = 0; i < name.length; i++) {
            if (name[i] != ' ') {
                start = i;
                break;
            }
        }

        for (let i = name.length - 1; i >= 0; i--) {
            if (name[i] != ' ') {
                end = i;
                break;
            }
        }

        return name.substring(start, end + 1);

    }

    GetTagsOrder(code) {
        let tagsOrder = [];

        for (let i = 0; i < code.length; i++) {
            let ch = code[i];

            let strch = '';

            if (code[i] == '"' || code[i] == "'" || code[i] == '`') {
                strch = code[i];

                i++;

                for (; i < code.length; i++) {
                    if (code[i] == '"' || code[i] == "'" || code[i] == '`') {
                        break;
                    }
                }

                if (i >= code.length) {
                    break;
                }

            }

            let regex = /^[a-zA-Z]+$/;
            let regex2 = /^[0-9]+$/;

            if (ch == '<' && this.IsStartTag(i, code)) {
                let tagStart = i;
                let tagEnd = i;
                let startN = i + 1;
                for (let j = i + 1; j < code.length; j++) {
                    let chj = code[j];

                    if (chj.match(regex) || chj == '_' || chj == '-') {
                        startN = j;
                        break;
                    }

                }
                if (true) {
                    if (true) {
                        let endTagName = startN + 1;
                        for (let j = startN + 1; j < code.length; j++) {
                            let chj = code[j];

                            if (chj == ' ' || chj == '>' || chj == '/') {
                                endTagName = j - 1;
                                break;
                            }
                        }

                        let tagName = code.substring(startN, endTagName + 1);

                        tagName = this.GetTagNameFromString(tagName);

                        if (tagName == 'use') {
                            let checkIsCloseStart = startN;
                            let __tagStart = startN;
                            let isCloseTag = false;
                            for (let t = checkIsCloseStart; t >= 0; t--) {
                                if (code[t] == '<') {
                                    __tagStart = t;
                                    break;
                                }
                            }
                            for (let t = __tagStart + 1; t < checkIsCloseStart; t++) {
                                if (code[t] == '/') {
                                    isCloseTag = true;
                                    break;
                                }
                            }
                            if (!isCloseTag) {
                                this.useLevel++;

                                let useLevel = this.useLevel;
                                let endTagNameUse = endTagName + 1;
                                let endBaseName = endTagNameUse + 1;
                                for (let t = endTagNameUse; t < code.length; t++) {
                                    if (code[t] == '>') {
                                        endBaseName = t;
                                        break;
                                    }
                                }
                                let baseName = this.ClearSpace(code.substring(endTagNameUse, endBaseName));

                                this.useBases.push({
                                    level: useLevel,
                                    name: baseName
                                });
                            } else {
                                let lastOpenTagBaseIndex = this.useBases.length - 1;
                                let base = new Object();
                                let baseIndex = lastOpenTagBaseIndex;
                                for (let t = lastOpenTagBaseIndex; t >= 0; t--) {
                                    if (this.useBases[t].level == this.useLevel) {
                                        base = this.useBases[t];
                                        baseIndex = t;
                                        break;
                                    }
                                }

                                let bases = [];
                                for (let t = 0; t < this.useBases.length; t++) {
                                    if (t != baseIndex) {
                                        bases.push(this.useBases[t]);
                                    }
                                }
                                this.useBases = bases;
                                this.useLevel--;
                            }
                        }


                        let tagNameCache = '';

                        for (let j = 0; j < tagName.length; j++) {
                            let isSTN = false;

                            if (tagName[j] == '-') {
                                isSTN = true;
                                tagNameCache += '_';
                            }

                            if (tagName[j] == ':') {
                                isSTN = true;
                                tagNameCache += '/';
                            }

                            if (!isSTN)
                                tagNameCache += tagName[j];
                        }

                        tagName = tagNameCache;

                        let tag = {
                            ...this.GetTag(tagName)
                        };

                        tag.start = tagStart;

                        tagsOrder.push(tag);

                    }

                }
            }

        }

        return tagsOrder;
    }

    GetElementsFromTagsOrder(tagsOrder, code) {
        let result = new Element();
        let openTags = new Object();

        let level = 0;
        let currentElement = result;

        for (let i = 0; i < tagsOrder.length; i++) {
            if (!tagsOrder[i].isAutoClose) {
                if (openTags[tagsOrder[i].name] == null) {
                    level++;
                    openTags[tagsOrder[i].name] = tagsOrder[i];
                    let element = new Element();
                    element.NFramework = this.NFramework;
                    element.tag = tagsOrder[i];
                    element.startContentIndex = tagsOrder[i].start;
                    currentElement.AppendChild(element);
                    currentElement = element;
                } else {
                    level--;
                    openTags[tagsOrder[i].name] = null;
                    currentElement.endContentIndex = tagsOrder[i].start;
                    currentElement = currentElement.parent;
                }
            } else {
                let element = new Element();
                element.NFramework = this.NFramework;
                element.tag = tagsOrder[i];
                element.startContentIndex = tagsOrder[i].start;
                for (let j = element.startContentIndex; j < code.length; j++) {
                    if (code[j] == '>') {
                        element.endContentIndex = j;
                        break;
                    }
                }
                currentElement.AppendChild(element);
            }

            tagsOrder[i].level = level;

        }

        return result;
    }

    CompileSpecialCharaters(code) {
        let result = '';


        for (let i = 0; i < code.length; i++) {
            let isSpecialChr = false;

            let compiledChr = '';

            result += code[i];
        }

        return result;
    }

    GetElementsFromCode(code) {
        let result = [];

        let tagsOrder = this.GetTagsOrder(code);

        let elements = this.GetElementsFromTagsOrder(tagsOrder, code);

        result = elements;

        return result;
    }

    CompileElement(element, codeinput) {
        let manager = this.NFramework.nmoduleManager;
        let code = '';
        let einputCode = new Object();

        einputCode.data = codeinput;

        if (element.tag == null) {
            for (let i = 0; i < element.childs.length; i++) {
                let ei_code = this.CompileElement(element.childs[i], codeinput);
                code += `

                    ${ei_code}

                `;
            }
            if (element.forSV) {
                code = `module.exports=(manager)=>{
                var exports=new Object();
                    var nmodules=[];
                    var pages=[];
                    exports.customTypeDatas=[];
                    exports.customTypeDatas.Add=function(key,value){
                        exports.customTypeDatas.push({
                            'key':key,
                            'value':value
                        });
                    }

                    ${code}

                    exports.nmodules=nmodules;
                    exports.pages=pages;
                    return exports;
                }
                `;
            } else {
                code = `manager=window.NFramework.nmoduleManager;
                ${code}
                `;
            }
            element.code = code;
        } else {
            if (element.tag.isAutoClose) {
                code = element.tag.Compile(element, '', einputCode, manager);
                element.code = code;
            } else {
                let childsCode = '';
                for (let i = 0; i < element.childs.length; i++) {
                    let ei_code = this.CompileElement(element.childs[i], codeinput);
                    element.childs[i].code = ei_code;
                    childsCode += `

                        ${ei_code}

                    `;
                }
                code = element.tag.Compile(element, childsCode, einputCode, manager);
                element.code = code;
            }
        }
        return code;
    }

    SetSideForElements(elements, forSV) {
        elements.forSV = forSV;

        for (let i = 0; i < elements.childs.length; i++)
            elements.childs[i] = this.SetSideForElements(elements.childs[i], forSV);

        return elements;
    }

    CompileFastGet(code) {
        let result = '';

        let isInStr = false;

        let strC = '';

        let isVarInTemplateLiterals = false;

        for (let i = 0; i < code.length; i++) {
            if (code[i] + code[i + 1] == '////') {
                for (; i < code.length; i++) {
                    if (code[i] == '\r' || code[i] == '\n') {
                        break;
                    }
                }
            } else if (code[i] + code[i + 1] == '//*') {
                i += 2;
                for (; i < code.length; i++) {
                    if (code[i] == '*' || code[i + 1] == '//') {
                        break;
                    }
                }
            } else {
                if (!isInStr) {
                    if (code[i] == '"' || code[i] == "'") {
                        isInStr = true;
                        strC = code[i];

                    } else if (code[i] == '`') {
                        isInStr = true;
                        strC = code[i];
                        isVarInTemplateLiterals = false;
                    }
                } else {
                    isInStr = (code[i] == '"' || code[i] == "'" || code[i] == '`') ? false : isInStr;
                }


                if (!isInStr && code[i] == '@') {
                    i++;
                    let startName = i;
                    let endName = i;
                    let regex = /^[a-zA-Z]+$/;
                    let regex2 = /^[0-9]+$/;

                    for (; i < code.length; i++) {
                        if (!(code[i].match(regex) || code[i].match(regex2) || code[i] == '_' || code[i] == '-')) {
                            endName = i;
                            break;
                        }
                    }

                    let name = code.substring(startName, endName);

                    result += `(manager.Get('${name}'))`;

                    i -= 1;
                } else {
                    result += code[i];
                }

            }
        }

        return result;
    }

    CompileNModuleFastGetterAndSetter(code) {
        let result = '';
        let top = '';

        let strC = code[i];

        let isInStr = false;

        let isVarInTemplateLiterals = false;

        for (let i = 0; i < code.length; i++) {

            if (code[i] + code[i + 1] == '////') {
                for (; i < code.length; i++) {
                    if (code[i] == '\r' || code[i] == '\n') {
                        break;
                    }
                }
            } else if (code[i] + code[i + 1] == '//*') {
                i += 2;
                for (; i < code.length; i++) {
                    if (code[i] == '*' || code[i + 1] == '//') {
                        break;
                    }
                }
            } else {
                if (!isInStr) {
                    if (code[i] == '"' || code[i] == "'") {
                        isInStr = true;
                        strC = code[i];
                    } else if (code[i] == '`') {
                        isInStr = true;
                        strC = code[i];
                        isVarInTemplateLiterals = false;
                    }
                } else {
                    isInStr = (code[i] == '"' || code[i] == "'" || code[i] == '`') ? false : isInStr;
                }

                if (code[i] + code[i + 1] == '->' && (!isInStr || isVarInTemplateLiterals)) {
                    let name = '';
                    i += 2;
                    for (; i < code.length; i++) {
                        if (code[i] != ' ') {
                            break;
                        }
                    }
                    let startPropName = i;

                    if (i >= code.length) {
                        break;
                    }

                    let regex = /^[a-zA-Z]+$/;
                    let regex2 = /^[0-9]+$/;

                    for (; i < code.length; i++) {
                        if (!(code[i].match(regex) || code[i] == '_' || code[i].match(regex2))) {
                            break;
                        }
                    }

                    let endPropName = i;

                    name = code.substring(startPropName, endPropName);

                    let forCheckIsSetterIndex = endPropName;

                    let isSetter = false;

                    let setterEqualChrIndex = forCheckIsSetterIndex;

                    let endSetterIndex = forCheckIsSetterIndex;

                    for (let j = forCheckIsSetterIndex; j < code.length; j++) {
                        if ((code[j].match(regex) || code[j] == '_') || code[i] == ';' || code[i] == '.' || code[i] == '}' || code[i] == '{' || code[i] == '(' || code[i] == ')' || code[i] == '+' || code[i] == '-' || code[i] == '>' || code[i] == '<' || code[i] == '\\' || code[i] == '*') {
                            break;
                        }

                        if (code[j] == '=') {
                            setterEqualChrIndex = j;
                            isSetter = true;
                            break;
                        }

                    }
                    if (!isSetter) {
                        result += `.GetThisWithCallback((module)=>{
                            return module.Get('${name}');
                        })`;
                        i--;
                    } else {
                        let nextCode = code.substring(setterEqualChrIndex + 1, code.length);
                        const {
                            v4: uuidv4
                        } = require('uuid');
                        let fid = uuidv4();

                        let fid2 = '';

                        for (let fi = 0; fi < fid.length; fi++) {
                            if (fid[fi] == '-') {
                                fid2 += '_';
                            } else {
                                fid2 += fid[fi];
                            }
                        }

                        fid = fid2;

                        top += `
                            var a${fid}_module;
                        `;
                        result += `.GetThisWithCallback((module)=>{
                            a${fid}_module=module;
                        })
                        var getterObj${fid}={
                            set stter(value) {
                                a${fid}_module.Set('${name}',value);
                            }
                        }
                        getterObj${fid}.stter=`;
                        result += nextCode;

                        let nextCompile = this.CompileNModuleFastGetterAndSetter(result);
                        result = nextCompile.code;
                        top += nextCompile.top;
                        break;
                    }
                } else if (code[i] + code[i + 1] + code[i + 2] == '-->' && (!isInStr || isVarInTemplateLiterals)) {
                    let name = '';
                    i += 3;
                    for (; i < code.length; i++) {
                        if (code[i] != ' ') {
                            break;
                        }
                    }
                    let startPropName = i;

                    if (i >= code.length) {
                        break;
                    }

                    let regex = /^[a-zA-Z]+$/;
                    let regex2 = /^[0-9]+$/;

                    for (; i < code.length; i++) {
                        if (!(code[i].match(regex) || code[i].match(regex2) || code[i] == '_')) {
                            break;
                        }
                    }

                    let endPropName = i;

                    name = code.substring(startPropName, endPropName);

                    let forCheckIsSetterIndex = endPropName;

                    let isSetter = false;

                    let setterEqualChrIndex = forCheckIsSetterIndex;

                    let endSetterIndex = forCheckIsSetterIndex;

                    for (let j = forCheckIsSetterIndex; j < code.length; j++) {

                        if ((code[j].match(regex) || code[j] == '_') || code[i] == ';' || code[i] == '.' || code[i] == '}' || code[i] == '{' || code[i] == '(' || code[i] == ')' || code[i] == '+' || code[i] == '-' || code[i] == '>' || code[i] == '<' || code[i] == '\\' || code[i] == '*') {
                            break;
                        }

                        if (code[j] == '=') {
                            setterEqualChrIndex = j;
                            isSetter = true;
                            break;
                        }

                    }

                    const {
                        v4: uuidv4
                    } = require('uuid');
                    let fid = uuidv4();

                    let fid2 = '';

                    for (let fi = 0; fi < fid.length; fi++)
                        fid2 += (fid[fi] == '-') ? '_' : fid[fi];

                    fid = fid2;

                    if (!isSetter) {
                        top += `var a${fid}_module;
                        `;
                        result += `.AsyncGetThisWithCallback(async (module)=>{
                            a${fid}_module=module;
                            return await a${fid}_module.AsyncGet('${name}');
                        })
                        `;
                        i--;
                    } else {
                        let nextCode = code.substring(setterEqualChrIndex + 1, code.length);


                        //.Set('${name}',${value})
                        top += `
                            var a${fid}_module;
                        `;
                        result += `.AsyncGetThisWithCallback(async (module)=>{
                            a${fid}_module=module;
                        })
                        var getterObj${fid}={
                            set stter(value) {
                                (async ()=>{
                                    await a${fid}_module.AsyncSet('${name}',value);
                                })();
                            }
                        }
                        getterObj${fid}.stter=`;
                        result += nextCode;
                        let nextCompile = this.CompileNModuleFastGetterAndSetter(result);
                        result = nextCompile.code;
                        top += nextCompile.top;
                        break;
                    }


                } else {
                    result += code[i];
                }
            }


        }

        return {
            'code': result,
            'top': top
        };
    }

    RemoveComments(code) {
        let result = '';
        let strChr = '';
        let isInStr = false;
        for (let i = 0; i < code.length; i++) {
            if (!isInStr && (code[i] == "'" || code[i] == '`' || code[i] == '"')) {
                isInStr = true;
                strChr = code[i];
            } else {
                if (code[i] == strChr) {
                    isInStr = false;
                }
            }
            if (!isInStr) {
                if (code[i] == '/' & code[i + 1] == '*') {
                    for (let j = i + 1; j < code.length; j++) {
                        if (code[j - 1] == '*' && code[j] == '/') {
                            i = j + 1;
                            break;
                        }
                    }
                }

                if (code[i] == '/' & code[i + 1] == '/') {
                    for (let j = i + 1; j < code.length; j++) {
                        if (code[j] == '\r' || code[j] == '\n') {
                            i = j + 1;
                            break;
                        }
                    }
                }
            }


            if (i >= code.length) {
                break;
            }

            result += code[i];
        }
        return result;
    }

    CompileCode(code, forSV) {
        let result = code;

        this.useBases = [];
        this.useLevel = 0;

        let removedCommentsCode = this.RemoveComments(code);

        let elements = this.GetElementsFromCode(removedCommentsCode);

        elements = this.SetSideForElements(elements, forSV);

        let compiledElement = this.CompileElement(elements, removedCommentsCode);

        let compiledSpecialCharactersCode = this.CompileSpecialCharaters(compiledElement);

        let cmpiledNModuleFastGetterAndSetter = this.CompileNModuleFastGetterAndSetter(compiledSpecialCharactersCode);

        let cnmfgas = cmpiledNModuleFastGetterAndSetter.top + cmpiledNModuleFastGetterAndSetter.code;

        result = this.CompileFastGet(cnmfgas);

        return result;
    }

    CompileFile(path) {

        let code = fs.readFileSync(path).toString();

        let compiledCodeSV = this.CompileCode(code, true);

        let compiledCodeCL = this.CompileCode(code, false);

        let cResult = this.CreateModuleFromCode(compiledCodeSV, compiledCodeCL, path);

        return cResult;
    }

}

module.exports = NCompiler;
