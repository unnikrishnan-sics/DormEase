const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/create-session
// @access  Private
exports.createCheckoutSession = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        const booking = await Booking.findById(bookingId).populate('roomId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Room Rent - Room ${booking.roomId.roomNumber}`,
                        },
                        unit_amount: amount * 100, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
            metadata: {
                bookingId: bookingId,
                userId: req.user._id.toString()
            }
        });

        // Record pending payment
        await Payment.create({
            bookingId,
            userId: req.user._id,
            amount,
            paymentStatus: 'Pending',
            stripeSessionId: session.id
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Handle Stripe Webhook (Simplified for demonstration)
// @route   POST /api/payments/webhook
// @access  Public (Stripe handles auth)
exports.handleStripeWebhook = async (req, res) => {
    // In a real app, verify Stripe signature
    const event = req.body;

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Update payment status
        const payment = await Payment.findOne({ stripeSessionId: session.id });
        if (payment) {
            payment.paymentStatus = 'Paid';
            await payment.save();
        }
    }

    res.json({ received: true });
};
