var debug = require('debug')('nodejs-gpx-mongodb:server');
var mongoose = require('mongoose');

var dbURI = 'mongodb://localhost:27017/leaflet_map';
//leaflet_map ultraresultgpx

var Schema = mongoose.Schema;

// Mongoose Model definition
//var Json = mongoose.model('JString', JsonSchema, 'layercollection');

var userSchema = new Schema({
  name: String,
  email: {type: String, unique:true},
  createdOn: { type: Date, default: Date.now },
  modifiedOn: Date,
  lastLogin: Date
});


var JsonSchema = new Schema(
    {
	name: String,
	type: Schema.Types.Mixed
    },
    {
	collection : 'layercollection'
    }
)
// -> inside route/*.js file
// var Json = mongoose.model('Json');

var trackSchema = new Schema({

});

// // adding new static method for projects
// projectSchema.statics.findByUserID = function(userid, callback) {
//   this.find(
//     { createdBy: userid },
//     '_id projectName',
//     { sort: 'modifiedOn' },
// 	callback
//   );
// }

// make a connection
mongoose.connect(dbURI);

// Build/Compile User and Project models
mongoose.model('User', userSchema);
mongoose.model('Track', trackSchema);
mongoose.model('Json', JsonSchema);

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
	console.log('Mongoose disconnected through app termination (SIGINT)');
	process.exit(0);
    });
});
