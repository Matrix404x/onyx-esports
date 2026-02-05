import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import auth from '../middleware/auth.js'; // Optional: if you want to protect payment

const router = express.Router();

// Route to create a payment intent typically needs authentication
router.post('/create-payment-intent', auth, createPaymentIntent);

export default router;
