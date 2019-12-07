var express=require('express');
var nodemailer = require('nodemailer');
var Nexmo=require('nexmo');

var app=express();

var session = require('express-session');
var flash=require('connect-flash');
var expressValidator=require('express-validator');


app.set("view engine",'ejs'); 

app.use(express.static('./public'));

var bodyParser=require('body-parser');

var urlencodedParser=bodyParser.urlencoded({extended: false});

const nexmo = new Nexmo({
  apiKey: '0aabd16f',
  apiSecret: 'sxBlxAb8zkpkxPSU'
},{debug:true});

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

mongoose.connect('mongodb://localhost/find_doc');

//??
//var db = mongoose.connection;

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
	fee:String,
	votes:Number,
	gender:String,
	exp : Array,
	//msgs : Array
});

var RecordSchema = new mongoose.Schema({
	title:String,
	name:String,
	date:String,
	type:String
});

var PatientSchema = new mongoose.Schema({
	pname:String,
	pnumber:String,
	page:String,
	pemail:String,
	pgender:String,
	pdate:String,
	ptime:String,
	paddress:String,
});

var TestSchema = new mongoose.Schema({
	test:String,
	labname:String,
	address:String,
	facilties:String,
	amount:String,
});

var AppointmentSchema = new mongoose.Schema({
	name:String,
	date:String,
	age:String,
	email:String,
	docname:String,
	mobile:String
});

var CategorySchema = new mongoose.Schema({
	category:String
}); 

var Patient= mongoose.model('Patient',PatientSchema,'Patient');
var Test= mongoose.model('Test',TestSchema,'Test');
var Record= mongoose.model('Record',RecordSchema,'Record');
var Doctor= mongoose.model('Doctor',DoctorSchema,'Doctor');
var Category= mongoose.model('Category',CategorySchema,'Category');
var Appointment= mongoose.model('Appointment',AppointmentSchema,'Appointment');

app.get('/doctors/:category',function(req,res){
	var query={category:req.params.category};
	Doctor.find(query,function(err,data){
		if(err) throw err;
		res.render('project5browse',{doctors:data});
	});
});

app.get('/records',function(req,res){

	res.render('project5records1');
});

app.post('/record2',urlencodedParser,function(req,res){

	const mobileno=req.body.mobileno;
	req.checkBody('mobileno','Mobile Number should be valid').isMobilePhone();
	app.locals.fullname=req.body.fullname;
	req.checkBody('fullname','Name should be atleast 3 characters long').isLength({min:3});
	let errors = req.validationErrors();

	if(errors){
		req.flash('error','Error is there');
	}

    var x=Math.random()*99999+10000;
    nexmo.message.sendSms('Nexmo',mobileno,x);
	res.render('project5records2',{number:mobileno});
});

app.post('/record3',function(req,res){
    
    Record.find({},function(err,data){
    	if(err) throw err;
    	res.render('project5records3',{recorddata:data});
    });
});


app.get('/nexttest/:id',function(req,res){

    var query={_id:req.params.id};
	Test.find(query,function(err,data){
		if(err) throw err;
		app.locals.lab=data;
		res.render('project5labpage1');
	});
});

app.post('/testfinal',urlencodedParser,function(req,res){

	req.checkBody('pname','Name should be atleast 3 characters long').isLength({min:3});
	req.checkBody('pnumber','Phone Number should be valid').isMobilePhone();
	req.checkBody('page','Age should be valid').isNumeric();
	req.checkBody('pemail','Email should be valid').isEmail();
	let errors = req.validationErrors();
	if(errors){
			req.flash('info',errors);
			res.render('project5labpage1',{msgs:req.flash('info')});
	}
    else{
	var p1=Patient({pname:req.body.pname,pnumber:req.body.pnumber,page:req.body.page,pemail:req.body.pemail,
		pgender:req.body.pgender,pdate:req.body.pdate,ptime:req.body.ptime,paddress:req.body.paddress}).save(function(err){
		if(err) throw err;
	});
	res.redirect('/testfinalconfirm');
}
});

app.get('/testfinalconfirm',function(req,res){

	Patient.find({},function(err,data){
		if(err) throw err;
		res.render('project5testconfirm',{confirm:data});
	});
});

app.get('/delete/:id',function(req,res){
    
    var query={_id:req.params.id};
	Record.remove(query,function(err){
		if(err) throw err;
	});
	Record.find({},function(err,data){
    	if(err) throw err;
    	res.render('project5records3',{recorddata:data});
    });

});

app.get('/tests',function(req,res){

	Test.find({},function(err,data){
		if(err) throw err;
		res.render('project5tests',{data:data});
	});
});

app.post('/testpage1',urlencodedParser,function(req,res){

	var query={test:req.body.testname};
	Test.find(query,function(err,data){
		if(err) throw err;
		res.render('project5test2',{testdetails:data});
	})
});

app.get('/share/:id',function(req,res){
    
    res.render('project5recordshare');

});

app.post('/record4',urlencodedParser,function(req,res){
 
	var record1=Record({title:req.body.title,date:req.body.date,type:req.body.type,name:req.body.fullname}).save(function(err){
		if(err) throw err;
	});

	Record.find({},function(err,data){
    	if(err) throw err;
    	res.render('project5records3',{recorddata:data});
    });
 
});

app.get('/upload',function(req,res){

	res.render('project5uploadrecord');
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
    
    req.checkBody('name','Name should be atleast 3 characters long').isLength({min:3});
	req.checkBody('phnnumber','number is required').isMobilePhone();
	req.checkBody('state','State is required').isEmpty();
	req.checkBody('category','Category is required').isEmpty();
	req.checkBody('city','City is required').isEmpty();
    let errors = req.validationErrors();
	if(errors){
			res.render('project5errors',{errors:errors});
		}
		else
		{    
			var doctorThree= Doctor({phnnumber:req.body.phnnumber,name:req.body.name,state:req.body.states,
									category:req.body.category,accepting:req.body.accepting,pname:req.body.pname,
									address:req.body.address,year:req.body.year,
									city:req.body.city,zipcode:req.body.code}).save(function(err,data){
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
    
    req.checkBody('name','Name should be atleast 3 characters long').isLength({min:3});
	req.checkBody('mobile','Phone Number should be valid').isMobilePhone();
	req.checkBody('age','Age should be valid').isNumberic();
	req.checkBody('email','Email should be valid').isEmail();
	let errors = req.validationErrors();
	if(errors){
			console.log(errors);
	}

	var appointmentOne=Appointment({mobile:req.body.mobile,email:req.params.email,docname:req.params.docname,
		name:req.body.name,age:req.body.age,date:req.body.date}).save(function(err,data){
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

	req.checkBody('category','Category is required').isEmpty();

	let errors = req.validationErrors();
	if(errors){
			console.log(errors);
	}

	var categoryThree= Category({category:req.body.category}).save(function(err,data){
	if(err) throw err;
});
	res.redirect('/');
});

app.get('/details/:id',function(req,res){

	var query={_id:req.params.id};
	Doctor.find(query,function(err,data){
		if(err) throw err;
		//console.log(data[0]);
		app.locals.doctor = data[0];
		res.render('project5details',{doctor:data[0]});
});
});

// app.get('/filters',function(req,res){

// 	res.render('project5filterpage');
// });

// app.post('/filtered',urlencodedParser,function(req,res){

// 	var query={gender:req.body.gender,fee:req.body.fee};
// 	Doctor.find(query,function(err,data){
// 		if(err) throw err;
// 		res.render('project5browse',{doctors:data});
// 	});
// });

app.get('/share_exp/:id' , function(req,res){

	Doctor.find({_id:req.params.id}, function(err , data){
		if(err) throw err;
		res.render('project5shareexp' , {doctor : data[0]});
	});
});

app.post('/exp/:id' , urlencodedParser , function(req,res){

	var {recommend,issue,waittime,quality,experience,name,email,number} = req.body;
	var exp = {recommend,issue,waittime,quality,experience,name,email,number};
	Doctor.update({_id:req.params.id}, {$push : {exp:exp}} , function(err){
		if(err) throw err;
	});
	//??
	res.redirect('/details/'  + req.params.id)
});

//app.get('/contactdoc/:id',function(req,res))

app.listen('8080');

//see front end once again
// filter wla
//chat wla
