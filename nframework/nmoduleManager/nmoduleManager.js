const fs                = require('fs');
const global_nmodule    = require('./global_nmodule/global_nmodule');

class NModuleManager {
    constructor() {
        this.customTypeDatas        = new Object();
        this.customTypeDataInfos    = new Object();
        this.jsCode                 = new Object();
        this.pages                  = new Object();
        this.modules                = new Object();
        this.textContents           = new Object();

        this.modulePaths            = [];
        this.svMJSPaths             = [];
        this.clMJSPaths             = [];
        this.nlcPaths               = [];
        this.watches                = [];
    }

    Routing() {
        const express_server = this.NFramework.express_server;
        const manager = this;

        express_server.get('/textContents', (req, res) => res.send(manager.textContents));
    }

    SetupGetterAndSetterForSyncProps() {
        const express_server = this.NFramework.express_server;
        const manager = this;

        express_server.get('/getSyncProp/:module/:name', (req, res) => {
            let moduleName = req.params.module;
            let syncPropName = req.params.name;

            let property = manager.GetModule(moduleName).Get(syncPropName);

            let data = {
                value: property
            };

            let jsonText = JSON.stringify(data);

            res.send(jsonText);
        });

        express_server.get('/setSyncProp/:module/:name/:data', (req, res) => {
            let moduleName = req.params.module;
            let syncPropName = req.params.name;
            let data = JSON.parse(req.params.data);

            manager.GetModule(moduleName).Set(syncPropName, data);

            res.send('DONE');
        })
    }

    BuildModulePathsArray() {
        const src_path = this.NFramework.nmodules_src_dir;
        const framework_src_path = this.NFramework.framework_nmodules_src_dir;
        const nmm = this;

        let buildmpa = function(file) {
            let parts = file.split('.');
            if (parts[parts.length - 1] == 'nlc') nmm.modulePaths.push(file);
            else if (parts[parts.length - 1] == 'showjs') fs.unlinkSync(file);
            else if (
                parts[parts.length - 3] == 'nlc' &&
                parts[parts.length - 1] == 'js' &&
                (parts[parts.length - 2] == 'server' || parts[parts.length - 2] == 'client')
            ) {
                fs.unlinkSync(file);
            }
        };

        const isDir = function(path) {
            let isD = false;
            let stats = fs.statSync(path);
            isD = stats.isDirectory();

            return isD;
        }

        const DoWithAllFile = function(dirPath) {
            fs.readdirSync(dirPath).forEach(file => {

                const filePath = dirPath + '/' + file;

                if (isDir(filePath)) DoWithAllFile(filePath);
                else buildmpa(filePath);
            });
        }

        DoWithAllFile(framework_src_path);
        DoWithAllFile(src_path);

    }

    GetJSCode(name) {
        return this.jsCode[name];
    }

    CompileModules() {
        const compiler = this.NFramework.ncompiler;

        for (let filePath of this.watches)
            fs.unwatchFile(filePath);

        this.watches = [];

        for (let modulePath of this.modulePaths) {
            let cr = compiler.CompileFile(modulePath);

            if (this.NFramework.debug.show_nlc_compiled_js) {
                let showerCompiledFileSV = '';
                showerCompiledFileSV += cr.dirNLCPath;
                showerCompiledFileSV += '/';
                showerCompiledFileSV += cr.fileNLCName;
                showerCompiledFileSV += '.server.showjs';

                fs.writeFileSync(showerCompiledFileSV, cr.codeSV);

                let showerCompiledFileC = '';
                showerCompiledFileC += cr.dirNLCPath;
                showerCompiledFileC += '/';
                showerCompiledFileC += cr.fileNLCName;
                showerCompiledFileC += '.client.showjs';

                fs.writeFileSync(showerCompiledFileC, cr.codeCL);
            }

            this.svMJSPaths.push(cr.fileJSSVPath);
            this.clMJSPaths.push(cr.fileJSCPath);
            this.nlcPaths.push(cr.fileNLCPath);

            let nlcfilePath = cr.fileNLCPath;

            if (this.NFramework.debug.client_nlc) {
                const manager = this;
                this.watches.push(nlcfilePath);
                fs.watchFile(nlcfilePath, (curr, prev) => {
                    manager.CompileModules();
                    manager.ReRoutingModulesForClient();
                });
            }
        }
    }

    ReRoutingModulesForClient() {
        let keys = Object.keys(this.modules);
        for (let key of keys) {
            let clMJSPath = this.modules[key].clMJSPath;
            this.modules[key].client_js_code = fs.readFileSync(clMJSPath);
        }
    }

    AutoSetParent(name) {
        let nameParts = name.split('-');
        let newName = nameParts[nameParts.length - 1];

        if (nameParts.length == 1) return 0;    // End

        let parentName = '';
        for (let i = 0; i < nameParts.length - 2; i++)
            parentName += nameParts[i] + '-';

        parentName += nameParts[nameParts.length - 2];

        let parentModule = this.modules[parentName];

        if (parentModule) {
            parentModule.AddProperty(newName);
            parentModule.Set(newName, this.modules[name]);
        }
    }

    ImportModules() {
        let useALlGlobalObjs_pages = [];

        for (let modulePath of this.svMJSPaths) {
            let eps = require(modulePath)(this);

            for (let ctData of eps.customTypeDatas) {
                this.customTypeDatas[ctData.key]                        = ctData.value;
                this.customTypeDataInfos[ctData.key]                    = new Object();
                this.customTypeDataInfos[ctData.key].isSetupCLRouter    = false;
                this.customTypeDataInfos[ctData.key].path               = this.clMJSPaths[i];
            }

            eps.manager = this;
            let modules = eps.nmodules;

            for (let [i, module] of modules.entries()) {    // ESC6
                let moduleName = module.name;
                this.modules[moduleName]            = module;
                this.modules[moduleName].manager    = this;
                this.modules[moduleName].clMJSPath  = this.clMJSPaths[i];
                this.modules[moduleName].AfterImported();
            }

            let pages = eps.pages;
            for (let page of pages) {
                this.pages[page.name] = page;
                if (page.useAllGlobalObjects)
                    useALlGlobalObjs_pages.push(page.name);
            }
        }

        let moduleNames = Object.keys(this.modules);
        for (let moduleName of moduleNames)
            this.AutoSetParent(moduleName);

        for (let pageName of useALlGlobalObjs_pages) {
            this.pages[pageName].customTypeDatas = Object.keys(this.customTypeDatas);
            this.pages[pageName].SetupGlobalObjectsRouter();
        }
    }

    Setup() {
        let keys = Object.keys(this.modules);
        for (let key of keys) this.modules[key].Setup();
    }

    Start() {
        let keys = Object.keys(this.modules);
        for (let key of keys) this.modules[key].Start();
    }

    GetModule(name) {
        return this.modules[name];
    }

    GetPage(name) {
        return this.pages[name];
    }

    Get(name) {
        if (name in this.modules)
            return this.modules[name];
        else if (name in this.pages)
            return this.pages[name];
        else if (name in this.customTypeDatas)
            return this.customTypeDatas[name];
    }
}

module.exports = NModuleManager;
