import express from 'express';
import { register, login, OTPVerify, getProfileData } from '../Controllers/Auth.js';
import sendMail from '../services/SendMail.js';
import {stockname} from '../Utils/StockNames.js'
import NewsScraper from '../Utils/NewsScraper.js';
import { CompleteInfo } from '../Utils/NewsScraper.js';
import { jwtAuthMiddleware } from '../Middlewares/JWT.js';
import stockSearch from '../Controllers/StockNameAPI.js';
import TransactionVerify, { StockTransaction } from '../Controllers/Transaction.js';
import StockPrice from '../Utils/StockPrice.js';
import Knowledge_Center from '../Controllers/Knowledge_Center.js';
import stocknews from '../Utils/stocknews.js';
import stockDashboard from '../Utils/stockDashboard.js';
const router = express.Router();
router.get('/', (req, res) => {
  res.status(200).json({message: 'Hello World'});
});
//Authentication
router.post('/register', register);
router.post('/login', login);
router.post('/OTPVerify', OTPVerify);
router.get('/profiledata',jwtAuthMiddleware,getProfileData)
router.post('/verification',jwtAuthMiddleware,TransactionVerify);
router.post('/Transaction',jwtAuthMiddleware,StockTransaction);

//services
router.get('/sendMail', sendMail);
router.get('/scrapweb', NewsScraper);
router.get('/scrapweb/info',CompleteInfo)
router.get('/stockname', stockname);
router.get('/stocksearch', stockSearch);
router.get('/stockprice',StockPrice);
router.get('/stocknews',stocknews);
router.get('/knowledge_center',Knowledge_Center);
router.get('/dashboard',stockDashboard)
export default router;