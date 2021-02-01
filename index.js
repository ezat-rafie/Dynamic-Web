// import dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator');

//set up mongo db connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/assignment4',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//set up model for mongo db
const Order = mongoose.model('Order', {
    formName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postcode: String,
    province: Number,
    apple: Number,
    orange: Number,
    toiletPaper: Number,
    deliveryTime: Number,
    subTotal: Number,
    tax: Number,
    total: Number,
});

// variables
var myApp = express();
myApp.use(bodyParser.urlencoded({extended:false}));

//set up routes
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');

//Validations
//Regular expressions for validations
var phoneRegex = /^[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/; 
var postRegex = /^[A-Z][0-9][A-Z]\s?[0-9][A-Z][0-9]$/;
var anythingRegex = /^.+$/;
var productRegex = /^[0-9]{1,9}$/;
var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

//General regex checker
function checkRegex(userInput, regex){
    if(regex.test(userInput)){
        return true;
    }
    else{
        return false;
    }
}

//Validate phone using regex
function phoneValidation(phone){
    if(!checkRegex(phone, phoneRegex)){
        throw new Error('Phone should be in correct format');
    }
    return true;
}

//Validate postcode using regex
function postcodeValidation(postcode){
    if(!checkRegex(postcode, postRegex)){
        throw new Error('Postcode should be in correct format');
    }
    return true;
}

//Name validation
function nameValidation(formName){
    if(!checkRegex(formName, anythingRegex)){
        throw new Error('Name is required');
    }
    return true;
}
//Email Validation
function emailValidation(email){
    if(!checkRegex(email, emailRegex)){
        throw new Error('Email should be in correct format');
    }
    return true;
}

//Address Validation
function addressValidation(address){
    if(!checkRegex(address, anythingRegex)){
        throw new Error('Address is required');
    }
    return true;
}

//City Validation
function cityValidation(city){
    if(!checkRegex(city, anythingRegex)){
        throw new Error('City is required');
    }
    return true;
}

//Address Validation
function addressValidation(address){
    if(!checkRegex(address, anythingRegex)){
        throw new Error('Address is required');
    }
    return true;
}

//Product Validation
function productValidation(value, {req}){
    var apple = req.body.apple;
    var orange = req.body.orange;
    var toiletPaper = req.body.toiletPaper;

    if(!checkRegex(apple, productRegex) && !checkRegex(orange, productRegex) && !checkRegex(toiletPaper, productRegex)){
        throw new Error('Cart is empty');
    }
    return true;
}

//home page
myApp.get('/', function(req, res){
    res.render('form'); 
});

//When submitting
myApp.post('/',[
    check('formName', '').custom(nameValidation),
    check('email', '').custom(emailValidation),
    check('phone', '').custom(phoneValidation),
    check('address', '').custom(addressValidation),
    check('city', '').custom(cityValidation),
    check('postcode', '').custom(postcodeValidation),
    check('product', '').custom(productValidation)
],function(req, res){

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('form', {
            errors:errors.array()
        });
    }
    else{
        var formName = req.body.formName;
        var email = req.body.email;
        var phone = req.body.phone;
        var address = req.body.address;
        var city = req.body.city;
        var postcode = req.body.postcode;
        var province = req.body.province;
        var apple = req.body.apple;
        var orange = req.body.orange;
        var toiletPaper = req.body.toiletPaper;
        var deliveryTime = req.body.deliveryTime;

        var taxRate = province - 1;
        var tax = ( (apple * 60) + (orange * 40) + (toiletPaper * 20)  + deliveryTime) * taxRate;
        tax = Math.round(tax);
        var subTotal = ( (apple * 60) + (orange * 40) + (toiletPaper * 20)  + deliveryTime);
        subTotal = Math.round(subTotal);
        total = ( (apple * 60) + (orange * 40) + (toiletPaper * 20) + deliveryTime) * province;
        total = Math.round(total);

        var pageData = {
            formName : formName,
            email : email,
            phone : phone, 
            address : address,
            city : city,
            postcode : postcode,
            province : province,
            apple : apple,
            orange : orange,
            toiletPaper : toiletPaper,
            deliveryTime : deliveryTime,
            subTotal : subTotal,
            tax : tax,
            total : total
        }

        //store to db
        var newOrder = new Order(pageData);
        newOrder.save().then(function(){
            console.log('record saved');
        });

        res.render('form', pageData);
    }
});

//all order page
myApp.get('/allorders', function(req, res){
    Order.find({}).exec(function(err, orders){
        console.log(err);
        res.render('allorders', {orders: orders});
    });
});

// start the server and listen
myApp.listen(8080);
console.log('Everything executed fine.. website at port 8080....');

