const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Student = require('../models/Student');

// Helper to handle all post-payment core logic
const fulfillPayment = async (paymentIdOrObj) => {
    let payment;
    if (typeof paymentIdOrObj === 'string' || paymentIdOrObj instanceof require('mongoose').Types.ObjectId) {
        payment = await Payment.findById(paymentIdOrObj);
    } else {
        payment = paymentIdOrObj;
    }

    if (!payment || payment.paymentStatus === 'Paid') return;

    payment.paymentStatus = 'Paid';
    payment.paymentDate = payment.paymentDate || Date.now();
    await payment.save();

    // 1. Update Student Profile
    const student = await Student.findOne({ userId: payment.userId });
    if (student) {
        // Update status to Allocated if they have a room
        if (student.currentRoomId) {
            student.bookingStatus = 'Allocated';
        }

        // Extend or Set Subscription End Date
        const packageType = payment.packageType || student.packageType || 'Monthly';
        let monthsToAdd = 1;
        if (packageType === '6 Months') monthsToAdd = 6;
        else if (packageType === '12 Months') monthsToAdd = 12;
        else if (packageType === '24 Months') monthsToAdd = 24;

        // If current subscription is still active, extend from end date. Otherwise start from today.
        const currentEndDate = student.subscriptionEndDate && student.subscriptionEndDate > new Date() 
            ? student.subscriptionEndDate 
            : new Date();
        
        const newEndDate = new Date(currentEndDate);
        newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);
        
        student.subscriptionEndDate = newEndDate;
        await student.save();
    }

    // 2. Update Booking if any
    if (payment.bookingId) {
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
            booking.status = 'Confirmed';
            await booking.save();
        }
    }
    
    return payment;
};

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

        // 1. Create local payment record first to get ID
        const payment = await Payment.create({
            bookingId,
            userId: req.user._id,
            amount,
            paymentStatus: 'Pending',
            packageType: 'Monthly' // Defaults to Monthly for room rent usually
        });

        const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:5173';
        
        // 2. Create Stripe session with local paymentId in metadata
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
            success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment._id}`,
            cancel_url: `${clientUrl}/payment-cancelled`,
            metadata: {
                paymentId: payment._id.toString(),
                bookingId: bookingId,
                userId: req.user._id.toString()
            }
        });

        // 3. Update payment with session identity
        payment.stripeSessionId = session.id;
        await payment.save();

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
        const { paymentId, bookingId } = session.metadata;
        
        // 1. Update by specific Payment ID if provided (preferred)
        if (paymentId) {
            await fulfillPayment(paymentId);
        } 
        // 2. Fallback to Booking lookup
        else if (bookingId) {
            const payment = await Payment.findOne({ bookingId, paymentStatus: 'Pending' });
            if (payment) {
                await fulfillPayment(payment);
            }
        }
    }

    res.json({ received: true });
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'Admin') {
            query = { userId: req.user._id };
        }

        const payments = await Payment.find(query)
            .populate('userId', 'name email')
            .populate({
                path: 'bookingId',
                populate: { path: 'roomId', select: 'roomNumber' }
            })
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manually record an offline payment
// @route   POST /api/payments/manual
// @access  Private/Admin
exports.recordManualPayment = async (req, res) => {
    try {
        const { userId, amount, paymentMethod, paymentDate, bookingId, packageType } = req.body;

        const payment = await Payment.create({
            userId,
            amount,
            paymentMethod,
            paymentDate: paymentDate || Date.now(),
            paymentStatus: 'Pending', // Set to Paid via fulfillPayment
            bookingId,
            packageType: packageType || 'Monthly'
        });

        await fulfillPayment(payment);

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get basic financial stats
// @route   GET /api/payments/stats
// @access  Private/Admin
exports.getFinanceStats = async (req, res) => {
    try {
        const totalRevenue = await Payment.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const pendingCount = await Payment.countDocuments({ paymentStatus: 'Pending' });

        // Last 30 days revenue
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentRevenue = await Payment.aggregate([
            { $match: { paymentStatus: 'Paid', updatedAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        res.json({
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingPayments: pendingCount,
            recentRevenue: recentRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Pay a pending invoice via Stripe
// @route   POST /api/payments/:id/pay
// @access  Private/Student
exports.payInvoice = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate({
                path: 'bookingId',
                populate: { path: 'roomId', select: 'roomNumber' }
            });
        
        if (!payment) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check ownership
        if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized to pay this invoice' });
        }

        if (payment.paymentStatus === 'Paid') {
            return res.status(400).json({ message: 'Invoice is already paid' });
        }

        const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `DormEase Payment - ${payment.bookingId?.roomId?.roomNumber ? 'Room ' + payment.bookingId.roomId.roomNumber : 'Subscription Fee'}`,
                        },
                        unit_amount: Math.round(payment.amount * 100), // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment._id}`,
            cancel_url: `${clientUrl}/payments`,
            metadata: {
                paymentId: payment._id.toString(),
                userId: req.user._id.toString()
            }
        });

        // Store session ID in payment record for verification
        payment.stripeSessionId = session.id;
        await payment.save();

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({ message: error.message || 'Stripe error', details: error.type });
    }
};

// @desc    Verify Stripe Session status and fulfill payment (Webhook Failsafe)
// @route   GET /api/payments/verify/:sessionId
// @access  Private
exports.verifyPaymentSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const { paymentId, bookingId } = session.metadata;
            
            // Fulfill payment using metadata
            if (paymentId) {
                await fulfillPayment(paymentId);
            } else if (bookingId) {
                const payment = await Payment.findOne({ bookingId, stripeSessionId: sessionId });
                if (payment) await fulfillPayment(payment);
            }

            res.json({ status: 'Paid', success: true });
        } else {
            res.json({ status: session.payment_status, success: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get upcoming expiring subscriptions (3-day window)
// @route   GET /api/payments/expiring
// @access  Private/Admin
// @desc    Get upcoming expiring subscriptions (3-day window)
// @route   GET /api/payments/expiring
// @access  Private/Admin
exports.getExpiringSubscriptions = async (req, res) => {
    try {
        const Student = require('../models/Student');
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const expiringStudents = await Student.find({
            subscriptionEndDate: { $lte: threeDaysFromNow, $gt: new Date() }
        }).populate('userId', 'name email').populate('currentRoomId', 'roomNumber');

        res.json(expiringStudents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send reminders to students whose subscriptions are expiring soon
// @route   POST /api/payments/remind-expiring
// @access  Private/Admin
exports.sendReminders = async (req, res) => {
    try {
        const Student = require('../models/Student');
        const { sendExpirationReminderEmail } = require('../utils/emailService');
        
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const expiringStudents = await Student.find({
            subscriptionEndDate: { $lte: threeDaysFromNow, $gt: new Date() }
        }).populate('userId', 'name email').populate('currentRoomId', 'roomNumber');

        let sentCount = 0;
        for (const student of expiringStudents) {
            const sent = await sendExpirationReminderEmail(
                student.userId.email,
                student.userId.name,
                student.currentRoomId?.roomNumber || 'N/A',
                student.subscriptionEndDate
            );
            if (sent) sentCount++;
        }

        res.json({ message: `Successfully sent ${sentCount} reminders.`, sentCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

