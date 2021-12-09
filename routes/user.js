const express = require('express');
const authControllers = require('../controllers/user');

const { signIn, signUp, getUsers } = authControllers;
const router = express.Router()

router.get('/users', getUsers);
router.post('/register', signUp);
router.post('/login', signIn)

module.exports = router;