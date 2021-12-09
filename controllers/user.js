const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { nanoid } = require('nanoid')
const dotenv = require('dotenv');

dotenv.config();

const signUp = (req, res) => {
    const { email, password, phoneNumber, fullName } = req.body;
    const paymentID = nanoid(7);
    User.findOne({email}, (err, user)=>{
        if(err||!user){
            const newUser = new User({email, password, phoneNumber, fullName, paymentID});
            newUser.save((error, saved) => {
                if(error) return res.status(403).json({error})
                else if(saved) {
                    return res.status(200).json({message : "Sign up successful. Please login"})
                }
            })
        }
        else{
            return res.status(403).json({
                error: "Email is already registered"
            })
        }
    });
};

const signIn = (req, res) => {
    //find the user based on email
    const { email, password } = req.body;
    User.findOne({email}, (err, user) => {
        //if err or no user
        if(err || !user) {
            return res.status(401).json({
                error : "User with that email does not exist. Please sign up"
            })
        }
        //if user is found, make sure the email and password match
        if(!user.authenticate(password)) {
            return res.status(401).json({
                error : "Email and password do not match"
            }) 
        }

        //if user is found, authenticate
        //generate a token with user id and secret
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn : 3000000});
    
        //return response with user and token to frontend client
        const { _id, email, fullName, balance, paymentID } = user;
        return res.json({token, user : {_id, email, fullName, balance, paymentID}});
    })
    
}

const getUsers = (req, res) => {
    User.find().select('fullName paymentID balance joined email')
    .then(users => {
        res.json({ users });
    })
    .catch(err => console.log(err))
}

const tokenValid = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({error :'Session expired, please relogin'});
    }
    next();
}
const requireSignIn = expressJwt({
    //if token is valid, express jwt appends the verified users id in an auth key to the request object
    secret : process.env.JWT_SECRET,
    algorithms: ['HS256'],
    userProperty : "auth"
});

const confirmUser = (req, res, next) => {
    User.findById(req.body.user)
    .exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: "Authentication error, please relogin and try again"
            })
        }
        req.profile = user; // adds profile object in req with user info
        next();
    })
}

const hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!authorized) {
        return res.status(403).json({
            error : "User is not authorized to perform this action"
        })
    }
    next()
}
const generateNewID = (req, res) => {
    const newPaymentID = nanoid(7);

}
module.exports = { signUp, signIn, requireSignIn, tokenValid, confirmUser, hasAuthorization, getUsers, generatePaymentID };