let express = require("express");

let mongoose = require("mongoose");

let URL = "mongodb+srv://nitingtb8:123Kartik@cluster0.jgoob.mongodb.net/sqldemo1";

async function DB_Connect()
{
try
{
await mongoose.connect(URL);
console.log("success!! database connected");
}
catch(err)
{
console.log("databse not connected");
}

}

const CustomerSchema = mongoose.Schema({});

const Customer = mongoose.model("Customer",CustomerSchema);



DB_Connect();

server = express();

server.get("/",async(req,res)=> {

   /* let products = await Customer.aggregate([
        {
            $lookup:
        
        { from: 'payments', localField: 'customerNumber', foreignField: 'customerNumber', as: 'payments' } }
    ]);*/


    let products = await Customer.aggregate([
        {
            $project:{
                customerName:1,customerNumber:1,country:1,_id:0    
            }
        },
          {
            $lookup: {
                from: "payments",
                localField: "customerNumber",
                foreignField: "customerNumber",
                as: "pay",
              }
          },
    
          {
                $project: {
                    customerName:1,customerNumber:1,country:1,"pay.amount":1
                 }
            },
            {
                $project: {
                    customerName:1,customerNumber:1,country:1,"total": {$sum: "$pay.amount" }
                 }
            }
     
       
    ]);

    res.json(products);
});


server.listen(4000,()=> {console.log("server started on 4000...")});