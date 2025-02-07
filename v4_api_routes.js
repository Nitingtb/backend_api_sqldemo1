let express = require("express");

let mongoose = require("mongoose");

let v4_api_router = express.Router();
////////////////////////
const {Emp} = require('./db');

v4_api_router.get("/users",async(req,res)=> {

    let result = await Emp.find().lean();

    res.json(result);

});


v4_api_router.post("/users",async(req,res)=> {

    let result = new Emp(req.body);

    await result.save();

    res.json({id:result._id});

    
});


v4_api_router.delete("/users",async(req,res)=> {

   let resp = await Emp.deleteOne(req.body.emp_del);

    

    res.json(resp);

    
});

exports.v4_api_routes = v4_api_router;