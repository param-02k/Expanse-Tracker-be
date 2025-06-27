const express = require('express');
const router = express.Router();
const { registeruser, loginuser, addExpense, getallexpanse, updateexpanse, deleteuser, logoutuser } = require('../controllers/controller');


router.post('/registeruser', registeruser);

router.post('/loginuser', loginuser);

router.post('/addexpense', addExpense);

router.get('/getallexpense', getallexpanse);

router.post('/updateexpense/:_id', updateexpanse);

router.post('/deleteuser', deleteuser);

router.post('/logoutuser', logoutuser);


module.exports = router;