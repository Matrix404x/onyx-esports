import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CheckCircle, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Load Stripe outside of component render to avoid recreating Stripe object
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message);
            toast.error(error.message);
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess();
        } else {
            setMessage("Unexpected state.");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            {message && <div className="text-red-400 text-sm">{message}</div>}

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Processing...
                    </span>
                ) : (
                    `Pay ₹${amount} & Join`
                )}
            </button>
            <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                <Lock size={10} /> Payments are secured by Stripe
            </p>
        </form>
    );
};

export default function PaymentModal({ amount, onClose, onSuccess }) {
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.post("/api/payments/create-payment-intent",
            { amount, currency: 'inr' },
            { headers: { 'x-auth-token': token } }
        )
            .then((res) => setClientSecret(res.data.clientSecret))
            .catch((err) => {
                console.error("Error creating payment intent:", err);
                setError("Failed to initialize payment.");
                toast.error("Could not initialize payment gateway.");
            });
    }, [amount]);

    const appearance = {
        theme: 'night',
        variables: {
            colorPrimary: '#06b6d4',
            colorBackground: '#0f172a',
            colorText: '#e2e8f0',
            colorDanger: '#f43f5e',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">Secure Checkout</h2>
                    <p className="text-slate-400 text-sm">Complete your payment to join the tournament.</p>
                </div>

                {error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                        {error}
                    </div>
                ) : clientSecret ? (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm amount={amount} onSuccess={onSuccess} onClose={onClose} />
                    </Elements>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                        <p className="text-slate-500 text-sm">Initializing Secure Gateway...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
