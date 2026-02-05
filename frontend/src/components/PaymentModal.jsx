import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CheckCircle, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast'; // Import toast for consistent errors

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
                // Return URL is required but we handle redirect or completion here.
                // For a modal, we might not want a redirect. 
                // However, 'redirect: "if_required"' is default for some payment methods.
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

    cvc: '',
        name: ''
});

const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    // Simulate API delay
    setTimeout(() => {
        // Mock Validation (super simple)
        if (cardData.number.length < 16) {
            setError('Invalid Card Number');
            setProcessing(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            onSuccess(); // Call the actual join function
        }, 1000);
    }, 2000);
};

if (success) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-green-500/50 p-8 rounded-2xl w-full max-w-md text-center shadow-2xl shadow-green-900/20 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-slate-400">You have been registered for the tournament.</p>
            </div>
        </div>
    );
}

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Secure Checkout</h2>
                    <p className="text-slate-400 text-sm">Entry Fee: <span className="text-white font-bold">₹{amount}</span></p>
                </div>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Card Number</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            maxLength="19"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                            required
                        />
                        <CreditCard className="absolute left-3 top-3 text-slate-600" size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Expiry</label>
                        <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase">CVC</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="123"
                                maxLength="3"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                                value={cardData.cvc}
                                onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                                required
                            />
                            <Lock className="absolute left-3 top-3 text-slate-600" size={16} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Cardholder Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        required
                    />
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 mt-2 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                >
                    {processing ? 'Processing...' : `Pay ₹${amount} & Join`}
                </button>

                <p className="text-center text-xs text-slate-600 flex items-center justify-center gap-1">
                    <Lock size={10} /> Payments are secure • This is a mock payment
                </p>
            </form>
        </div>
    </div>
);
}
