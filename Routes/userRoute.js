const router = require('express').Router()
const userCon = require('./../Controllers/userController');
const authCon = require('./../Controllers/authController')


router.route('/me').get(authCon.protect,userCon.me);
router.route('/getSaved').get(authCon.protect,userCon.getSaved)
router.route('/updatePassword').patch(authCon.protect,userCon.updatePassword);
router.route('/updateMe').patch(authCon.protect,userCon.updateMe);
router.route('/deleteMe').delete(authCon.protect,userCon.deleteMe);
router.route('/getAllUsers').get(userCon.getAllUsers);

module.exports = router
