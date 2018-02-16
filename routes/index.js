var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Json = mongoose.model('Json');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/maplayers', function (req, res) {
    Json.find({},{'name': 1}, function (err, docs) {
	res.json(docs);
    });
});

/* GET json data. */
router.get('/mapjson/:name', function (req, res) {
    if (req.params.name) {
	console.log("mapjson find: " + req.params.name);
	Json.findOne({ name: req.params.name },{},
		     function (err, docs) {
			 if (err) {
			     res.send(err);
			 } else {
			     res.json(docs);
			 }
		     });
    }
});


/* GET Map page. */
router.get('/map', function(req,res) {
    Json.find({},{}, function(e,docs){
	res.render('map', {
            "jmap" : docs,
            lat : 40.78854,
	    lng : -73.96374
        });
    });
});


module.exports = router;
