const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');

router
    .route('/')
    .get(verifyJWT, userController.getAllUsers)
    .post(userController.createNewUser);

// TODO:    Make routes for the U and D in CRUD
// TODO:    Also make routes for tracking user scores (win/loss ratio, # of games played etc...)

module.exports = router;
