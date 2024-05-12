const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);

router.get('/', gameController.getGames);
router.get('/stats', gameController.stats);
router.get('/:id', gameController.getSingleGame);
router.post('/create', gameController.createGame);
router.post('/guess', gameController.makeGuess);

module.exports = router;
