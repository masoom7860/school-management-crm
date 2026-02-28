const express = require('express');
const {
  createParent,
  loginParent,     
  getAllParents,
  getParentById, 
  deleteParent,
  updateParentPasswordWithOtp,
  
} = require('../controllers/parentController');

const router = express.Router();

router.post('/create', createParent);

router.post('/login', loginParent); 

router.get('/getAllParent/:schoolId', getAllParents);

router.get('getParent/:parentId', getParentById);

router.put('/updatepassword', updateParentPasswordWithOtp);  

router.delete('/delete/:parentId', deleteParent);

module.exports = router;
