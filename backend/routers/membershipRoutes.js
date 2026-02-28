const express = require('express');
const { createPlan, getAllPlans, changePlan } = require('../controllers/membershipController');
const router = express.Router();



router.post('/create', createPlan);
router.get('/all', getAllPlans);
router.put('/change-plan', changePlan);

module.exports = router;
