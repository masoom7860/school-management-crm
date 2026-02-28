const express = require('express');
const router = express.Router();
const { sendContact } = require('../controllers/contactController');

router.post('/create', sendContact);

module.exports = router;
