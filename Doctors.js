var express=require('express');
var nodemailer = require('nodemailer');

var app=express();

var session = require('express-session');
var flash=require('connect-flash');
var expressValidator=require('express-validator');

app.set("view engine",'ejs'); 

app.use(express.static('./public'));

var bodyParser=require('body-parser');

var urlencodedParser=bodyParser.urlencoded({extended: false});

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.use(expressValidator({
	expressFormatter: function(param,msg,value){
		var namespace = param.split('.')
		,root = namespace.shift()
		,formParam = root;

		while(namespace.length){
			formParam+= '[' + namespace.shift() + ']';
		}
		return{
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));


var mongoose=require('mongoose');

mongoose.connect('mongodb://project:project5@ds229722.mlab.com:29722/project5find');

var DoctorSchema = new mongoose.Schema({
	name:String,
	category:String,
	accepting:Boolean,
	pname:String,
	address:String,
	year:Number,
	city:String,
	state:String,
	zipcode:Number,
	phnnumber:String,
});

var AppointmentSchema = new mongoose.Schema({
	name:String,
	date:String,
	age:String,
	docname:String
});

var CategorySchema = new mongoose.Schema({
	category:String
}); 

var Doctor= mongoose.model('Doctor',DoctorSchema);
var Category= mongoose.model('Category',CategorySchema);
var Appointment= mongoose.model('Appointment',AppointmentSchema);

var categoryOne= Category({category:'General'}).save(function(err){
	if(err) throw err;
});
var categoryTwo= Category({category:'Neurologist'}).save(function(err){
	if(err) throw err;
});

var doctorOne= Doctor({phnnumber:'0000',name:'Rayansh Singh',category:'General',accepting:'true',pname:'Dr. Ray',address:'x1',year:'1998',city:'Udaipur',state:'Rajasthan',zipcode:'19900'}).save(function(err){
	if(err) throw err;
});

var doctorTwo= Doctor({phnnumber:'1111',name:'Aahana Sharma',category:'Neurologist',accepting:'true',pname:'Dr. Hana',address:'x2',year:'2000',city:'Gwalior',state:'Madhya Pradesh',zipcode:'12000'}).save(function(err){
	if(err) throw err;
});

app.get('/doctors/:category',function(req,res){
	var query={category:req.params.category};
	Doctor.find(query,function(err,data){
		if(err) throw err;
		res.render('project5browse',{doctors:data});
	});

});

app.post('/find',urlencodedParser,function(req,res){

	var query={state:req.body.states};
	Doctor.find(query,function(err,data){
		if(err) throw err;
		res.render('project5browse',{doctors:data});
	});
});

app.get('/',function(req,res){
    Category.find({},function(err,data){
		if(err) throw err;
		app.locals.categories=data;
	res.render('project5mainview');
});
});

app.get('/browse',function(req,res){

	Doctor.find({},function(err,data){
		if(err) throw err;
		res.render('project5browse',{doctors:data});
	});
});

app.get('/adddoctors',function(req,res){

	res.render('project5adddoctors');
});

app.post('/adddoctors',urlencodedParser,function(req,res){
    
    req.checkBody('name','name is required').notEmpty();
	req.checkBody('states','state is required').notEmpty();
    let errors = req.validationErrors();
	if(errors){
			res.render('project5errors',{errors:errors});
		}
		else
		{    
			var doctorThree= Doctor({phnnumber:req.body.phnnumber,name:req.body.name,state:req.body.states,category:req.body.category,accepting:req.body.accepting,pname:req.body.pname,address:req.body.address,year:req.body.year,city:req.body.city,zipcode:req.body.code}).save(function(err,data){
			if(err) throw err;
});
         res.redirect('/');
};
});

app.get('/bookingform/:name',function(req,res){
    
    app.locals.docname=req.params.name;
	res.render('project5bookingform');
});

app.post('/bookingform/:docname',urlencodedParser,function(req,res){

	var appointmentOne=Appointment({docname:req.params.docname,name:req.body.name,age:req.body.age,date:req.body.date}).save(function(err,data){
	if(err) throw err;
});
	var transporter = nodemailer.createTransport({
  service: 'gmail',
    auth: {
        user: "jainanjali043@gmail.com",
        pass: "anjali043"
    }
});

var mailOptions = {
  from: 'jainanjali043@gmail.com',
  to: req.body.email,
  subject: 'Appointment related mail',
  text: 'Your appointment is fixed on your mentioned date..' 
};

transporter.sendMail(mailOptions, function(error, response){
  if (error) {
    console.log(error);
  } 
  else {
    console.log('Email sent: ' + response.message);
  }
});
res.redirect('/');
});

app.get('/addcategory',function(req,res){

	res.render('project5addcategory');
});

app.post('/addcategory',urlencodedParser,function(req,res){

	var categoryThree= Category({category:req.body.category}).save(function(err,data){
	if(err) throw err;
});
	res.redirect('/');
});

app.get('/details/:id',function(req,res){

	Doctor.findById(req.params.id,function(err,data){
		if(err) throw err;
		res.render('project5details',{doctor:data});
});
});

app.listen('8080');