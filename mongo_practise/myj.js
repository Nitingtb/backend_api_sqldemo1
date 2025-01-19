
db.payments.find().forEach( (d)=> {

    var t = parseInt(d.amount);

    db.payments.updateOne({_id:d._id}, {$set: {amount:t} } )

} );