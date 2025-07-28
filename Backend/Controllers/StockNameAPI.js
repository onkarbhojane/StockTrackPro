import API from "../Utils/StockNames.js";


const stockSearch=(req,res)=>{
    try{
        console.log(req.query.name,'ppppppppppppppp');
        const pref=req.query.name;
        const Names=API.searchPrefix(pref).slice(0,5);
        console.log(Names.sort())

        res.status(200).json(Names.sort());
    }catch(e){
        console.log(e);
    }
}
export default stockSearch;