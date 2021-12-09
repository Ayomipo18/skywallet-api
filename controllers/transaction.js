const User = require('../models/user');
const Transaction = require('../models/transaction');

const transferMoney = async (req, res) => {
    let { amount, beneficiary } = req.body;
    amount = Number(amount);
    User.findById( beneficiary, (err, recipient) => {
        if(err || !recipient) return res.status(400).json({error : "Recipient not found, retry"})
        else {
            if(req.profile.balance - amount < 0) return res.status(400).json({error : 'Insufficient funds'})
            req.profile.balance -= amount;
            recipient.balance += amount;
            recipient.save()
            req.profile.save((err, saved) => {
                if(err) return res.status(400).json({error : "Error occured, try again!"})
                else {
                    let newTransaction = new Transaction(req.body);
                    newTransaction.save((error, trans) => {
                        if(error) return res.status(400).json({error : "Error occured, try again!"})
                        return res.json({message : 'Money sent successfully', user : saved})
                    })
                }
            })
        }
    });
}

const getAllTransactions = (req, res) => {
    Transaction.find().populate({path : 'user beneficiary', select : 'fullName email joined'})
    .then(transactions => {
        res.json({ transactions });
    })
    .catch(err => console.log(err))
}

getDebitsForUser = (req, res) => {
    let {user} = req.body;                                                      
    Transaction.find({user}).populate({path : 'user beneficiary', select : 'fullName email joined'})
    .exec((err, transactions) => {
        if(err) return res.status(400).json({error : "Error occured, try again!"})
        return res.json({transactions})
    })                   
}

getCreditsForUser = (req, res) => {
    let {user} = req.body;
    Transaction.find({beneficiary : user}).populate({path : 'user beneficiary', select : 'fullName email joined'})
    .exec((err, transactions) => {
        if(err) return res.status(400).json({error : "Error occured, try again!"})
        return res.json({transactions})
    })
}

module.exports = { transferMoney, getAllTransactions, getCreditsForUser, getDebitsForUser} ;