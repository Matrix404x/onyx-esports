import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const createPaymentIntent = async (req, res) => {
    try {
        if (!stripe) {
            console.error("Stripe Secret Key is missing.");
            return res.status(500).json({ message: "Payment gateway not configured correctly." });
        }

        const { amount, currency = 'inr' } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Stripe expects amount in lowest currency unit (e.g., paise)
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ message: error.message });
    }
};
