let express = require("express");

let mongoose = require("mongoose");

v2_api_router = express.Router();
////////////////////////


const OrderSchema = mongoose.Schema({});

const Order = mongoose.models.Order || mongoose.model("Order",OrderSchema);



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




exports.v2_api_routes = v2_api_router;
