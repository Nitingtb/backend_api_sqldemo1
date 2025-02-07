let express = require("express");

let mongoose = require("mongoose");

v3_api_router = express.Router();
////////////////////////


const OrderSchema = mongoose.Schema({});

const Order = mongoose.models.Order || mongoose.model("Order",OrderSchema);

const CustomerSchema = mongoose.Schema({});

const Customer = mongoose.models.Customer || mongoose.model("Customer",CustomerSchema);


const ProductSchema = mongoose.Schema({});

const Product = mongoose.models.Product || mongoose.model("Product",ProductSchema);



v3_api_router.get("/",async(req,res)=> {

    let result = await Order.aggregate([
       
        {
            $project : {_id:0}
        },
        {
            $lookup : {
                from: "orderdetails",
                localField: "orderNumber",
                foreignField: "orderNumber",
                as: "orders"
            }
        },
        {
           $unwind : "$orders"
        },
        {
            $addFields : {
                total_amount: {$multiply : ['$orders.priceEach','$orders.quantityOrdered']},
                productCode: "$orders.productCode"
            }
        },
        {
            $lookup : {
                from:"products",
                localField:"productCode",
                foreignField:"productCode",
                as: "productDetails",
                pipeline:[
                    {
                        $project: {productName:1,productLine:1,_id:0}
                    }
                ]
            }
        },
        {
            $unwind: "$productDetails"
        },
        {
            $addFields : {productName: "$productDetails.productName",productLine:"$productDetails.productLine"}
        },
        
        /*{
            $group: {
                _id:"$productLine",total_amount:{$sum: "$total_amount"},total_orders:{$sum:1}}
            
        }*/
       {
        $unset : ["orders","productDetails"]
       },
       {
        $group : {
            _id:{productCode:"$productCode",productName:"$productName"},total_amount: {$sum:"$total_amount"},total_orders:{$sum:1}
        }
       },
       {
        $addFields : { status : { $cond : [ {$gte :[ "$total_orders", 28] } , "Good" , "Bad"   ] } }
    }

    ]);

    res.json(result);
    
});



v3_api_router.get("/product_report",async(req,res)=> {

    let result = await Product.aggregate([
       
        {
            $project: {_id:0,productCode:1,productName:1,quantityInStock:1}
        },
        {
            $lookup: {
                from:"orderdetails",
                localField:"productCode",
                foreignField:"productCode",
                as: "OrderDetails",
                pipeline: [
                    {
                        $group: {
                            _id:"$productCode",total_quantity_order:{$sum: "$quantityOrdered"}
                        }
                    }
                    
                ]
            }
        },
        {
            $unwind: "$OrderDetails"
        },
        {
            $addFields: {total_quantity_order: "$OrderDetails.total_quantity_order"}
        },
        {
            $unset: "OrderDetails"
        },
        {
            $addFields: {remaining_quantity: {$subtract: ["$quantityInStock" , "$total_quantity_order"]}}
        },
        
       {
        $addFields : { status : { $cond : [ {$lte :[ "$remaining_quantity", 0] } , "Out Of Stock" , "In Stock"   ] } }
    }
     
    ]);

    res.json(result);

});



v3_api_router.get("/order_report",async(req,res)=> {

    let result = await Order.aggregate([
       
        {
            $project: {_id:0 }
        },
        { $addFields: {
            order_at: {
                $toDate: "$orderDate"
            }
        } },
        {
            $addFields : {month : {$month: "$order_at"}, 
            
            full_month: { $dateToString: { format: "%B", date: "$order_at", timezone: "+04:30" } } }
        },
        {
            $lookup: {
                from: "orderdetails",
                localField: "orderNumber",
                foreignField:"orderNumber",
                as: "orderDetails",
                pipeline: [
                    {
                        $project : {_id:0 ,amount:{$multiply: ["$priceEach","$quantityOrdered"]}}
                    },
                    {
                        $group: {_id:"orderNumber",total_amount:{$sum:"$amount"},amount_values: {$push: "$amount"} }
                    }
                ]
            }
        },
        {
            $unwind: "$orderDetails"
        },
        {
            $addFields : {total_amount: "$orderDetails.total_amount"}
        }  ,
        {
            $unset : "orderDetails"
        },
        {
            $lookup : {
                from:"customers",
                localField: "customerNumber",
                foreignField: "customerNumber",
                as : "customers",
                pipeline : [
                    {
                    $project: {_id:0,country:1,salesRepEmployeeNumber:1}
                    },
                    {
                        $lookup: {
                            from:"employees",
                            localField: "salesRepEmployeeNumber",
                            foreignField: "employeeNumber",
                            as : "emp",
                            pipeline : [
                                {
                                    $project : {lastName:1,officeCode:1,_id:0}
                                },
                                {
                                    $lookup: {
                                        from : "offices",
                                        localField: "officeCode",
                                        foreignField: "officeCode",
                                        as : "office",
                                        pipeline: [
                                            {
                                                $project: {city:1,_id:0}
                                            }
                                        ]
                                    }
                                },
                                {
                                    $unwind : "$office"
                                }

                            ]
                        }
                    },
                    {
                        $unwind : "$emp"
                    }
                ]
            }
        },
        {
            $unwind : "$customers"
        },
        {
            $addFields : {branch: "$customers.emp.office.city"}
        },
        {
            $unset : "customers"
        },
        {
            $group: {_id: {branch:"$branch",month:"$month",monthName:"$full_month"}, total_amount:{$sum:"$total_amount"}}
        },
        {
            $sort: {"_id.branch":1,"_id.month":1}
        },
        {
            $addFields: {branch:"$_id.branch",month:"$_id.monthName"}
        },
        {
            $unset: "_id"
        }/*,
        {
            $match: {
                "month":"November"
            }
        },
        {
            $group: {
                _id:"$month",tt:{$sum:"$total_amount"}
            }
        }*/

        
        
        
        /*
        {
            $addFields: {lastName: "$customers.emp.lastName"}
        },
        {
            $unset : "customers"
        },
        {
            $group: {_id:{lastName:"$lastName", month:"$full_month"}, total_amount:{$sum:"$total_amount"} }
        },
        {
            $sort : { "_id.lastName" : 1, "_id.month":1 }
        }, 
        
            for emp wise report */


 

        
        /*
        {
            $addFields : { country: "$customers.country" } 
        },
        {
            $group : {_id: {country:"$customers.country",month:"$full_month"} , total_amount:{$sum:"$total_amount"} }
        },
        {
            $sort : { "_id.country" : 1, "_id.month":1 }
        }, 
        for country wise reprt */ 
        
        
     
    ]);

    res.json(result);

});


exports.v3_api_routes = v3_api_router;