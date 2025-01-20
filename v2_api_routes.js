let express = require("express");

let mongoose = require("mongoose");

v2_api_router = express.Router();
////////////////////////


const OrderSchema = mongoose.Schema({});

const Order = mongoose.models.Order || mongoose.model("Order",OrderSchema);

const CustomerSchema = mongoose.Schema({});

const Customer = mongoose.models.Customer || mongoose.model("Customer",CustomerSchema);



v2_api_router.get("/check_report",async(req,res)=> {

    
    //let id = req.params.id;

    let result = await Order.aggregate([
        
        {
            $project: {
                _id:0
            },
        },

            {
            $lookup : {
                from: "orderdetails",
                localField:"orderNumber",
                foreignField:"orderNumber",
                pipeline : [
                    {
                        $addFields: {
                            amount: {$multiply: ["$priceEach","$quantityOrdered"]}
                        }
                    },
                    {
                        $group: {
                            _id: "$orderNumber", total_amount:{$sum:"$amount"}
                        }
                    },
                    {
                        $project: {_id:0}
                    }
                
                ],
                as : "orderDetails",
                
            }
        },
        {
            $unwind: "$orderDetails"
        }
           
        

        ]);

    res.json(result);
});


v2_api_router.get("/country_report1",async(req,res)=> {

    
    //let id = req.params.id;

    let result = await Order.aggregate([
        
        {
            $project: {
                _id:0
            },
        },

            {
            $lookup : {
                from: "orderdetails",
                localField:"orderNumber",
                foreignField:"orderNumber",
                pipeline : [
                    {
                        $addFields: {
                            amount: {$multiply: ["$priceEach","$quantityOrdered"]}
                        }
                    },
                    {
                        $group: {
                            _id: "$orderNumber", total_amount:{$sum:"$amount"}
                        }
                    },
                    {
                        $project: {_id:0}
                    }
                
                ],
                as : "total_amount",
                
            }
        },
        {
            $unwind: "$total_amount"
        },

        { 
            $addFields: { "total_amount": "$total_amount.total_amount" } 
    },
        {
            $lookup: {
                from: "customers",
                localField: "customerNumber",
                foreignField: "customerNumber",
                pipeline : [
                    {
                        $project: {
                            coustomerName:1,
                            country:1,
                            salesRepEmployeeNumber:1
                        }
                    }
                ],
                as : "customerDetails"
            }
        },
        {
            $unwind : "$customerDetails"
        }

        ]);

    res.json(result);
});


v2_api_router.get("/country_report2",async(req,res)=> {

    
    //let id = req.params.id;

    let result = await Customer.aggregate([
        
        {
            $project: {
                _id:0
            },
        },

        {
            $lookup: {
                from:"payments",
                localField:"customerNumber",
                foreignField: "customerNumber",
                pipeline: [
                    {
                        $group: {
                            _id:"$customerNumber",total_amount: {$sum: "$amount"},total_payments:{$sum:1},max_payment: {$max:"$amount"}
                        }
                    },
                    {
                        $project: { _id:0 }
                    }
                ],
                as : "payments"
            }
        },
        {
            $unwind: "$payments"
        }
        ,
        {
            $addFields : {total_amount: "$payments.total_amount"}
        }
            

        ]);

        result = result.map((d)=> {
           d.payments.max_payment_digits = digit_count(d.payments.max_payment)
           return d;
        });

    res.json(result);
});


function digit_count(a)
{
    let count=0;
    while(a>=1)
    {
        a=parseInt(a/10);

        count=count+1;
    }
    return count;
}

exports.v2_api_routes = v2_api_router;
