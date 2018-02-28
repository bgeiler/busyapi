var uuid = require('uuid/v4');

module.exports = function(app){
  app.post('/api/usages', function(req, res){
    
    // Store the supplied usage data
    //app.usages.push(req.body);
    
    var id = uuid();
    app.cache.set(id, req.body, 600, function(err) {
      if (err) console.log('Error during set: ' + err);
    });

    //var usageId = app.usages.length;
    //console.log('Stored usage count: ' + usageId);  //Don't display this to avoid IO hit to performance.
    
    app.usages++;  //Increment

    res.status(201).json({'id':id});
    
    
  });
}
