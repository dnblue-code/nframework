const JSCLPath = "/home/chrx/Desktop/nframework/nlc/demo.nlc.client.js";

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

        nmodule.name='demo';

        nmodule.__TYPE='NMODULE';

        nmodule.RunExternalMethod=function(callback){
            callback.call(nmodule);
        }


        nmodule.RunExternalMethod(function(){
    

    
        this.AddMethod('setup',(...args) => {
            let f=
    

        function(){
            console.log('running');
        }


    

    return f.call(this,...args);

}

    );

    


        });
    


        let fs=require('fs');

        let clientVersion=JSCLPath;

        nmodule.client_js_code=fs.readFileSync(clientVersion);



        if(nmodule.side!='server'){
            nmodule.Routing('/nmodules/demo',(req,res)=>{
                res.send(nmodule.client_js_code);
            });
        }

        

            nmodules.push(nmodule);

        

                

    exports.nmodules=nmodules;
    exports.pages=pages;
    return exports;
}