const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser } = require('../middleware/validation');

router.post('/register', validateUser, userController.register);
router.post('/login', validateUser, userController.login);

module.exports = router;
