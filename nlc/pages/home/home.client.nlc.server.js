var JSCLPath = "D:\\nframework_gr/nlc/pages/home/home.client.nlc.client.js";
                            var a17e43429_def6_44cb_96aa_b5ce9364d5c8_module;
                        module.exports=(manager)=>{
                var exports=new Object();
                    var nmodules=[];
                    var pages=[];

                    
                
                    

        var NModule=
        function(){

            return require("D:\\nframework_gr\\nframework\\ncompiler\\tags/../../nmodule/nmodule");

        }()
    
    ;
    
        var nmodule=new NModule();

        var This=nmodule;

        nmodule.side='both';

        nmodule.name='home-client';
    
    

    
    
    nmodule.AddSyncProperty('syncProp');
    
    

    

        
        nmodule.AddMethod('Setup',(...args)=>{
            var f=
    

            function(){
                this.GetThisWithCallback((module)=>{
                            a17e43429_def6_44cb_96aa_b5ce9364d5c8_module=module;
                        })
                        var getterObj17e43429_def6_44cb_96aa_b5ce9364d5c8={
                            set stter(value) {
                                a17e43429_def6_44cb_96aa_b5ce9364d5c8_module.Set('syncProp',value);
                            }
                        }
                        getterObj17e43429_def6_44cb_96aa_b5ce9364d5c8.stter=0;
            }   

        
        
    f.call(nmodule,...args); 

}
    
    );
    
    

    

    


        
    
        var fs=require('fs');

        var clientVersion=JSCLPath;

        var code=fs.readFileSync(clientVersion);
        
        if(nmodule.side!='server'){
            nmodule.Routing('/nmodules/home-client',(req,res)=>{
                res.send(code);
            });
        }

        

            nmodules.push(nmodule);
        
        
                
                
                    
                    exports.nmodules=nmodules;
                    exports.pages=pages;
                    return exports;
                }
                