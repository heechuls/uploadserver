// index.js start of file
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var path = require('path');
var upload = multer({ dest: './uploads/', rename : function (fieldname, filename, req, res) {
       var filename = req.body["receiver"] + "-" + currentTime()
       console.log("Created File : "+filename);
       return filename;
      }
    });
var GoogleUrl = require( 'google-url' );
var jbuilder = require('jbuilder');

googleUrl = new GoogleUrl( { key: 'AIzaSyBdtCANYjO3hONRi3-OP0eU6ezn-iIWng0' });
var app = new express();

function currentTime(){
  var current = new Date();
    var yyyy = current.getFullYear().toString();
    var mm = (current.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = current.getDate().toString();
    var date = yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
    var hour = current.getHours().toString();
    var min = current.getMinutes().toString();
    var sec = current.getSeconds().toString();
    var time = (hour[1]?hour:"0"+hour[0]) + (min[1]?min:"0"+min[0]) + (sec[1]?sec:"0"+sec[0]); // padding

  return date + "-" + time;
} 

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var home = "http://lunar-pic.com:5000";
var sms_sender = "023260118";
var urloption = "short";

app.get('/', function(req, res){
  res.render('index');
});

app.get('/sendsms', function(req, res){
  res.render('sendsms');
});

app.get('/link/:img', function(req, res){
  res.render('upload', { imgsrc: home + "/uploads/" + req.params.img});

  console.log(new Date().toString() + " : " + req.params.img);
});

app.get('/url', function(req, res){
  res.render('shorturl', { urloption:urloption});
  console.log(urloption);
});

app.post('/', upload, function(req,res){
	console.log(req.body); //form fields
	/* example output:
	{ title: 'abc' }
	 */
	/* example output:
            { fieldname: 'upl',
              originalname: 'grumpy.png',
              encoding: '7bit',
              mimetype: 'image/png',
              destination: './uploads/',
              filename: '436ec561793aa4dc475a88e84776b1b9',
              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
              size: 277056 }
	 */
	console.log(req.files);
  var url = home + "/link/" + req.files["filename"]["name"];
  var downUrl = home + "/uploads/" + req.files["filename"]["name"];
  //res.send(url);
  var retval;
  if(urloption == "short"){
    googleUrl.shorten( url, function( err, shortUrl) {
      console.log(new Date().toString() + " : " + shortUrl);
      retval = createOutput(downUrl, shortUrl);
      console.log(retval);
      res.send(retval);
      res.status(200).end();
      var full_msg = shortUrl + "\"";
//    sendLMS(sms_sender, req.body["receiver"], "Nike",  full_msg);
    });
  }
  else {
    retval = createOutput(downUrl, url);
    res.send(retval);
    res.status(200).end();
  }
});

app.use('/uploads', express.static('./uploads'));

app.post('/sendsms', function(req, res) {
    console.log(req.body);
    console.log(req.body.receiver);
    if(req.body['key'] == "nikesms"){
      sendLMS(sms_sender, req.body["receiver"], "Nike", req.body["url"]);
      res.end("OK");  
    }
    else res.end("Key Unmatched");

});

app.post('/urloptionchange', function(req, res) {
  console.log(req.body);
  urloption=req.body["url_filter"];
  res.send(200);
});

function sendLMS(sender, receiver, title, msg){
    var theJobType = 'FOO';
    var exec_str = "java -jar sendlms.jar " + sender + " " + receiver + " " + "\"" + title + "\" \""  + msg + "\"";
    console.log(exec_str);
    var exec = require('child_process').exec;
    var child = exec(exec_str, function( error, stdout, stderr) 
      {
          if ( error != null ) {
                console.log(stderr);
                // error handling & exit
          }
          // Success
      });
}

function createOutput(downUrl, url){
 return jbuilder.create(function(json) {
      json.set('downUrl', downUrl);
      json.set('url', url);
  });
}

var port = 5000;
app.listen( port, function(){ console.log('listening on port '+port); } );
// index.js end of file

