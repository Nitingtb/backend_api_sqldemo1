let express = require("express");

let mongoose = require("mongoose");

api_router = express.Router();
////////////////////////

const CustomerSchema = mongoose.Schema({});

const Customer = mongoose.model("Customer",CustomerSchema);


const OrderSchema = mongoose.Schema({});

const Order = mongoose.model("Order",OrderSchema);


const OrderdetailSchema = mongoose.Schema({});

const Orderdetail = mongoose.model("Orderdetail",OrderdetailSchema);


api_router.get("/customers",async(req,res)=> {

    /* let products = await Customer.aggregate([
         {
             $lookup:
         
         { from: 'payments', localField: 'customerNumber', foreignField: 'customerNumber', as: 'payments' } }
     ]);*/
 
 
     let products = await Customer.aggregate([
         {
             $project:{
                 customerName:1,customerNumber:1,country:1,_id:0,city:1    
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
                     customerName:1,customerNumber:1,country:1,"pay.amount":1,city:1
                  }
             },
             {
                 $project: {
                     customerName:1,customerNumber:1,country:1,"total": {$sum: "$pay.amount" },city:1
                  }
             }
      
        
     ]);
 
     res.json(products);
 });
 
 
 api_router.get("/customers/:id",async(req,res)=> {

    /* let products = await Customer.aggregate([
         {
             $lookup:
         
         { from: 'payments', localField: 'customerNumber', foreignField: 'customerNumber', as: 'payments' } }
     ]);*/
 
     let id = req.params.id;
 
     let products = await Customer.aggregate([

        {
            $match: {
                
                    customerNumber: parseInt(id)
                
            }
        },
         {
             $project:{
                 customerName:1,customerNumber:1,country:1,_id:0,city:1    
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
                     customerName:1,customerNumber:1,country:1,"pay.amount":1,city:1
                  }
             },
             {
                 $project: {
                     customerName:1,customerNumber:1,country:1,"total": {$sum: "$pay.amount" },city:1
                  }
             }
      
        
     ]);
 
     res.json(products);
 });
 

 api_router.get("/orders",async(req,res)=> {

    
     //let id = req.params.id;
 
     let result = await Order.find();

     res.json(result);
 });
 
 api_router.get("/orders/:id",async(req,res)=> {

    
    let id = parseInt(req.params.id);

    let result = await Order.find({orderNumber: id});

    res.json(result);
});


api_router.get("/orderdetails",async(req,res)=> {

    
    //let id = req.params.id;

    let result = await Orderdetail.aggregate([
        
        {
            $project: { orderNumber:1,productCode:1,
                total : {
                    $multiply: ["$quantityOrdered","$priceEach"]
                }
            }
        } 
        ,
        {
            $lookup: {
                from: "orders",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "order",
            }
        }, 
        {
            $project: {
                orderNumber:1,total:1,productCode:1,_id:0,order: {$arrayElemAt: ["$order",0]}
            }
        },
        {
            $group: {_id:"$orderNumber","total_amount": {$sum: "$total"},"order":{"$first":"$order"}}
        },
        {
            $project: {
                orderNumber:1,total_amount:1,orderDate:"$order.orderDate",customerNumber:"$order.customerNumber"
            }
        },
        {
            $lookup: {
                from: "customers",
                localField:"customerNumber",
                foreignField:"customerNumber",
                as:"customerDetails"
            }
        },

        {
            $set:
            {
                customerDetails:{$arrayElemAt: ["$customerDetails",0]}
            }
        }
    
       
        ]);

    res.json(result);
});



api_router.get("/orderdetails/:id",async(req,res)=> {

    
    let id = req.params.id;

    let result = await Orderdetail.aggregate([

        {
            $match : {orderNumber: parseInt(id)}
        },
        
        {
            $project: { orderNumber:1,productCode:1,
                total : {
                    $multiply: ["$quantityOrdered","$priceEach"]
                }
            }
        } 
        ,
        {
            $lookup: {
                from: "orders",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "order",
            }
        }, 
        {
            $project: {
                orderNumber:1,total:1,productCode:1,_id:0,order: {$arrayElemAt: ["$order",0]}
            }
        },
        {
            $group: {_id:"$orderNumber","total_amount": {$sum: "$total"},"order":{"$first":"$order"}}
        },
        {
            $project: {
                orderNumber:1,total_amount:1,orderDate:"$order.orderDate",customerNumber:"$order.customerNumber"
            }
        }
        ,
        {
            $lookup: {
                from: "customers",
                localField:"customerNumber",
                foreignField:"customerNumber",
                as:"customerDetails"
            }
        }
        ,
        {
            $set:
            {
                customerDetails:{$arrayElemAt: ["$customerDetails",0]}
            }
        }
    
    
       
        ]);

    res.json(result);
});



api_router.get("/country_wise_report",async(req,res)=> {

    
    //let id = req.params.id;

    let result = await Orderdetail.aggregate([
        
        {
            $project: { orderNumber:1,productCode:1,
                total : {
                    $multiply: ["$quantityOrdered","$priceEach"]
                }
            }
        } 
        ,
        {
            $lookup: {
                from: "orders",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "order",
            }
        }, 
        {
            $project: {
                orderNumber:1,total:1,productCode:1,_id:0,order: {$arrayElemAt: ["$order",0]}
            }
        },
        {
            $group: {_id:"$orderNumber","total_amount": {$sum: "$total"},"order":{"$first":"$order"}}
        },
        {
            $project: {
                orderNumber:1,total_amount:1,orderDate:"$order.orderDate",customerNumber:"$order.customerNumber"
            }
        },
        {
            $lookup: {
                from: "customers",
                localField:"customerNumber",
                foreignField:"customerNumber",
                as:"customerDetails"
            }
        },

        {
            $set:
            {
                customerDetails:{$arrayElemAt: ["$customerDetails",0]}
            }
        },
        {
            $group: {
                _id:"$customerDetails.country", "total_amount": {$sum: "$total_amount"}
            }
        }
    
       
        ]);

    res.json(result);
});




api_router.get("/emp_wise_report",async(req,res)=> {

    
    //let id = req.params.id;

    let result = await Orderdetail.aggregate([
        
        {
            $project: { orderNumber:1,productCode:1,
                total : {
                    $multiply: ["$quantityOrdered","$priceEach"]
                }
            }
        } 
        ,
        {
            $lookup: {
                from: "orders",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "order",
            }
        }, 
        {
            $project: {
                orderNumber:1,total:1,productCode:1,_id:0,order: {$arrayElemAt: ["$order",0]}
            }
        },
        {
            $group: {_id:"$orderNumber","total_amount": {$sum: "$total"},"order":{"$first":"$order"}}
        },
        {
            $project: {
                orderNumber:1,total_amount:1,orderDate:"$order.orderDate",customerNumber:"$order.customerNumber"
            }
        },
        {
            $lookup: {
                from: "customers",
                localField:"customerNumber",
                foreignField:"customerNumber",
                as:"customerDetails"
            }
        },

        {
            $set:
            {
                customerDetails:{$arrayElemAt: ["$customerDetails",0]}
            }
        },
        {
            $addFields: {
                saleEmpNumber: "$customerDetails.salesRepEmployeeNumber"
            }
        },
        {
            $project: {
                customerDetails:0
            }
        }
        ,
        {
            $lookup: {
                from: "employees",
                localField:"saleEmpNumber",
                foreignField:"employeeNumber",
                as: "salesEmp"

            }
        },
        {
        $set: {
            salesEmp: { $arrayElemAt: ["$salesEmp",0]}
        }

    },
    {
        $group: {
            _id:"$salesEmp.employeeNumber",total_amount:{$sum:"$total_amount"},lastName: {$first: "$salesEmp.lastName"}
        }
    }
    
       
        ]);

    res.json(result);
});




api_router.get("/branch_wise_report",async(req,res)=> {

    
    //let id = req.params.id;

    let result = await Orderdetail.aggregate([
        
        {
            $project: { orderNumber:1,productCode:1,
                total : {
                    $multiply: ["$quantityOrdered","$priceEach"]
                }
            }
        } 
        ,
        {
            $lookup: {
                from: "orders",
            localField: "orderNumber",
            foreignField: "orderNumber",
            as: "order",
            }
        }, 
        {
            $project: {
                orderNumber:1,total:1,productCode:1,_id:0,order: {$arrayElemAt: ["$order",0]}
            }
        },
        {
            $group: {_id:"$orderNumber","total_amount": {$sum: "$total"},"order":{"$first":"$order"}}
        },
        {
            $project: {
                orderNumber:1,total_amount:1,orderDate:"$order.orderDate",customerNumber:"$order.customerNumber"
            }
        },
        {
            $lookup: {
                from: "customers",
                localField:"customerNumber",
                foreignField:"customerNumber",
                as:"customerDetails"
            }
        },

        {
            $set:
            {
                customerDetails:{$arrayElemAt: ["$customerDetails",0]}
            }
        },
        {
            $addFields: {
                saleEmpNumber: "$customerDetails.salesRepEmployeeNumber"
            }
        },
        {
            $project: {
                customerDetails:0
            }
        }
        ,
        {
            $lookup: {
                from: "employees",
                localField:"saleEmpNumber",
                foreignField:"employeeNumber",
                as: "salesEmp"

            }
        },
        {
        $set: {
            salesEmp: { $arrayElemAt: ["$salesEmp",0]}
        }

    },
    {
        $lookup: {
            from: "offices",
            localField: "salesEmp.officeCode",
            foreignField: "officeCode",
            as : "branch"
        }
    },
    {
        $set : {
            branch: {
                $arrayElemAt: ["$branch",0]
            }
        }
    },
    {
        $group: {
            _id: "$branch.officeCode",total_amount:{$sum:"$total_amount"},city: {$first:"$branch.city"}
        }
    }
       
        ]);

    res.json(result);
});


api_router.get("/product_wise_report",async(req,res)=> {

    
    //let id = req.params.id;

    let result = await Orderdetail.aggregate([
        
        {
            $project: { orderNumber:1,productCode:1,
                total : {
                    $multiply: ["$quantityOrdered","$priceEach"]
                }
            }
        } 
       ,
        {
            $project: {
                orderNumber:1,total:1,productCode:1,_id:0}
            
        },
        
        {
            $lookup: {
                from: "products",
                localField: "productCode",
                foreignField: "productCode",
                as:"product"
            }
        },
        {
            $set : {
                product : {
                    $arrayElemAt : ['$product',0]
                }
            }
        },
        /*{
            $match: {
                "product.productLine": "Vintage Cars"
            }
        }*/
       
       {
        $group: {
            _id: "$product.productLine", total_orders: {$sum:1}, total_amount: {$sum: "$total"}
        }
       }
       

        ]);

    res.json(result);
});


exports.api_routes = api_router;