let express = require("express");

let mongoose = require("mongoose");


const {api_routes} = require("./api_routes");

const {v2_api_routes} = require("./v2_api_routes");

const {v3_api_routes} = require("./v3_api_routes");

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
console.log("databse not connected: "+err);
}

}



DB_Connect();

server = express();

var cors = require('cors');
server.use(cors());

server.use(express.json());  //for post data collect - req.body.
server.use(express.urlencoded({ extended: true }))  //for post data collect - req.body.


server.use("/",api_routes);

server.use("/v2/",v2_api_routes);

server.use("/v3/",v3_api_routes);


server.listen(4000,()=> {console.log("server started on 4000...")});

//https://mongoing.com/docs/reference/operator/aggregation/push.html