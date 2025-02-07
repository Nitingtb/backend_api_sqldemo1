let mongoose = require("mongoose");

const EmpSchema = mongoose.Schema({
    name:String,
    phone:String,
    city:String,
    salary:Number
    
});

exports.Emp = mongoose.models.Emp || mongoose.model("emp",EmpSchema);