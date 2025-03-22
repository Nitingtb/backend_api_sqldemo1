let express = require("express");

let mongoose = require("mongoose");

let v4_api_router = express.Router();
////////////////////////
const {Emp} = require('./db');

v4_api_router.get("/users",async(req,res)=> {

    let result = await Emp.find().lean();

    res.json(result);

});


v4_api_router.get("/users/:name",async(req,res)=> {

    var regex = new RegExp(["^", req.params.name, "$"].join(""), "i");

    let result = await Emp.findOne({name: regex}).lean();

    if(result)
    {
    res.json(result);
    }
    else
    {
        res.json({msg:"no employee found"})
    }

});


v4_api_router.get("/users/city/:city",async(req,res)=> {

    var regex = new RegExp(["^", req.params.city, "$"].join(""), "i");

    let result = await Emp.find({city: regex}).lean();

    if(result)
    {
    res.json(result);
    }
    else
    {
        res.json({msg:"no employee found"})
    }

});



v4_api_router.post("/users",async(req,res)=> {

    let result = new Emp(req.body);

    let resp = await result.save();

    res.json(resp);

    
});


v4_api_router.delete("/users",async(req,res)=> {

    var regex = new RegExp(["^", req.body.emp_del.name, "$"].join(""), "i");

   let resp = await Emp.deleteOne({ name : regex });

    

    res.json(resp);

    
});


v4_api_router.put("/users",async(req,res)=> {

    let upd = {...req.body.emp_upd}

    delete upd.name;

    var regex = new RegExp(["^", req.body.emp_upd.name, "$"].join(""), "i");

    let resp = await Emp.updateOne(  { name : { $regex : regex } }, {$set:  upd } );
 
     //console.log(req.body);

    // console.log(upd);
 
     res.json(resp); 
 
     
 });

exports.v4_api_routes = v4_api_router;