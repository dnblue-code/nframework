const JSCLPath = "/home/chrx/Desktop/nframework/nframework/nmodules/dom/dom.nlc.client.js";

module.exports = (manager) => {
    let exports     = new Object();
    let nmodules    = [];
    let pages       = [];
    exports.customTypeDatas=[];
    exports.customTypeDatas.Add=function(key,value){
        exports.customTypeDatas.push({
            'key':key,
            'value':value
        });
    }

    

                    

        let NModule=
        function(){

            return require("/home/chrx/Desktop/nframework/nframework/ncompiler/tags/../../nmodule/nmodule");

        }()

    ;

        let nmodule=new NModule();

        let This=nmodule;

        nmodule.side='both';

        nmodule.name='dom';

        nmodule.__TYPE='NMODULE';

        nmodule.RunExternalMethod=function(callback){
            callback.call(nmodule);
        }


        nmodule.RunExternalMethod(function(){
    

    


        });
    


        let fs=require('fs');

        let clientVersion=JSCLPath;

        nmodule.client_js_code=fs.readFileSync(clientVersion);



        if(nmodule.side!='server'){
            nmodule.Routing('/nmodules/dom',(req,res)=>{
                res.send(nmodule.client_js_code);
            });
        }

        

            nmodules.push(nmodule);

        

                

    exports.nmodules=nmodules;
    exports.pages=pages;
    return exports;
}