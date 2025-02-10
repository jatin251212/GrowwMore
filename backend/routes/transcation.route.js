import express from 'express';
import authentication from '../middlewares/isAuthenticare.js';
import { addMoney, clearMoney, verifyPayment } from '../controllers/transcation.controller.js';
const router=express.Router();

router.route('/addmoney').post(authentication,addMoney);
router.route('/clearmoney').get(authentication,clearMoney);
router.route('/verifypayment').post(authentication,verifyPayment);


export default router;
