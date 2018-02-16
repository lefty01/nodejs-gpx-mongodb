var debug = require('debug')('nodejs-gpx-mongodb:server');
var path = require('path');
var util = require('util');
var fs = require('fs');
var tj = require('togeojson');
var xmldom = require('xmldom');
var xml2js = require('xml2js');

var pretty = require('js-object-pretty-print').pretty;


exports.upload = function(req, res, next) {
    console.log('file upload form');

    res.render('upload', {
        title: 'Upload File'
    });
}

//app.post('/fileupload', function(req, res) {
exports.fileupload = function(req, res) {
    var fstream;
    var fsize = 0;
    var limit_reached = 0;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
	req.session.uploadedFile = req.session.uploadPath + filename;
	req.session.uploadedFileName = filename;
        console.log("Uploading: " + filename + " to: " + req.session.uploadPath);
	console.log("filename length: " + filename.length);
	console.log("file mimetype: " + mimetype);
	console.log("file encoding: " + encoding);

	// check mimetype ? / extension to only allow gpx files?
	file.on('data', function(data) {
	    console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
	    fsize += data.length;
	});

	// check for file size limit (currently 10MiB)
        file.on('limit', function() {
            console.log('file size limit reached!!!');
            //delete incomplete file
            fs.unlink(req.session.uploadPath + filename, function(err) {
		if (err) {
		    console.log("ERROR: unlink failed for file: " +
				req.session.uploadPath + filename);
		}
	    });
	    limit_reached = 1;
        });

        fstream = fs.createWriteStream(req.session.uploadPath + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
	    // store file size
	    req.session.uploadedFileSize = fsize;
	    
	    // check if size zero
	    if (fsize == 0) {
		console.log('file size is zero!!!');
		fs.unlink(req.session.uploadPath + filename, function(err) {
		    if (err) {
			console.log("ERROR: unlink failed for file: " +
				    req.session.uploadPath + filename);
		    }
		});
		res.send('ERROR: file has size of zero!');
            }
	    else if (limit_reached) {
		res.send('ERROR: file too large (limit is 10MB)!');
	    }
	    else {
		res.render('gpxinfo', {
		    'gpxfilename' : filename,
		    'gpxfilesize' : fsize
		});
	    }
	});
    });
}



// parse GPX
exports.parsegpx = function(req, res) {
    //res.send(util.format('Upload complete!<br>\nuploaded %s (%d Kb)',
    //			 path.basename(req.session.uploadedFile), req.session.uploadedFileSize / 1024));
    //path.parse(filename).name; // file.ext -> file
    //path.parse(filename).ext;  // file.ext -> .ext
    console.log("parsegpx: file=" + req.session.uploadedFileName);

    var outfile = req.session.uploadPath + path.parse(req.session.uploadedFileName).name + ".json";
    console.log("write json outfile: " + outfile);
    
    // using togeojson in nodejs
    // node doesn't have xml parsing or a dom. use xmldom
    var xmldomParser = new xmldom.DOMParser();
    var gpx = xmldomParser.parseFromString(fs.readFileSync(req.session.uploadedFile, 'utf8')); // 'ascii' ?
    var convertedGpx = tj.gpx(gpx);
    var convertedWithStyles = tj.gpx(gpx, { styles: true });
    console.log("GeoJSON: " + pretty(convertedGpx));
    //console.log(convertedGpx);

    //res.send(convertedWithStyles);
    // GeoJSON

    fs.writeFile(outfile, convertedGpx, function(err) {
	if(err) {
            return console.log(err);
	}
    });
    
    try {
	// read (last?) uploaded file
	var fileData = fs.readFileSync(req.session.uploadedFile, 'ascii');
	var parser = new xml2js.Parser();
	parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
	    json = result;
	});
	    
	//console.log("parsestring result: " + pretty(json));
    } catch (ex) {
	res.send(ex);
    };

    res.json(convertedGpx);
}
