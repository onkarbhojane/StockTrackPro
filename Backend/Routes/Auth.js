import express from 'express';
import { register, login,OTPVerify  } from '../Controllers/Auth.js';
import router from './Routes.js';
router.post('/register', register);
router.post('/login', login);
router.post('/OTPVerify', OTPVerify);