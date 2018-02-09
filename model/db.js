var debug = require('debug')('nodejs-gpx-mongodb:server');
var mongoose = require('mongoose');

var dbURI = 'mongodb://localhost:27017/ultraresultgpx';

var userSchema = new mongoose.Schema({
  name: String,
  email: {type: String, unique:true},
  createdOn: { type: Date, default: Date.now },
  modifiedOn: Date,
  lastLogin: Date
});

var trackSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  day:         String,
  hhmm:        String,
  startOrEnd:  String,
  start:     { type: Boolean, default: false },
  end:       { type: Boolean, default: false },
  pause:     { type: Number,  default: 50 }
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
