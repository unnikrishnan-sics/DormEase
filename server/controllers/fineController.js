const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Fine = require('../models/Fine');
const Student = require('../models/Student');

// @desc    Issue a new fine
// @route   POST /api/fines
// @access  Private (Admin/Staff)
exports.issueFine = async (req, res) => {
    try {
        const { studentId, type, amount, description, paymentMethod } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const fine = await Fine.create({
            studentId,
            type,
            amount,
            description,
            paymentMethod: paymentMethod || 'Card',
            issuedBy: req.user._id
        });

        res.status(201).json(fine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all fines
// @route   GET /api/fines
// @access  Private (Admin/Staff)
exports.getFines = async (req, res) => {
    try {
        const fines = await Fine.find()
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name email' }
            })
            .populate('issuedBy', 'name')
            .sort('-issuedAt');
        res.json(fines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's own fines
// @route   GET /api/fines/me
// @access  Private (Student)
exports.getMyFines = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const fines = await Fine.find({ studentId: student._id })
            .populate('issuedBy', 'name')
            .sort('-issuedAt');
        res.json(fines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get fines for a specific student
// @route   GET /api/fines/student/:id
// @access  Private (Admin/Staff)
exports.getStudentFines = async (req, res) => {
    try {
        const fines = await Fine.find({ studentId: req.params.id })
            .populate('issuedBy', 'name')
            .sort('-issuedAt');
        res.json(fines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update fine status (Mark as Paid)
// @route   PUT /api/fines/:id
// @access  Private (Admin/Staff)
exports.updateFineStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const fine = await Fine.findById(req.params.id);

        if (!fine) {
            return res.status(404).json({ message: 'Fine not found' });
        }

        fine.status = status;
        if (status === 'Paid') {
            fine.paidAt = Date.now();
        } else {
            fine.paidAt = undefined;
        }

        await fine.save();
        res.json(fine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete fine
// @route   DELETE /api/fines/:id
// @access  Private (Admin)
exports.deleteFine = async (req, res) => {
    try {
        const fine = await Fine.findById(req.params.id);
        if (!fine) {
            return res.status(404).json({ message: 'Fine not found' });
        }

        await fine.deleteOne();
        res.json({ message: 'Fine removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Initiate payment session for a fine
// @route   POST /api/fines/:id/pay
// @access  Private (Student)
exports.payFine = async (req, res) => {
    try {
        const fine = await Fine.findById(req.params.id);
        if (!fine) {
            return res.status(404).json({ message: 'Fine not found' });
        }

        if (fine.status === 'Paid') {
            return res.status(400).json({ message: 'Fine already paid' });
        }

        const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `DormEase Penalty - ${fine.type}`,
                            description: fine.description
                        },
                        unit_amount: Math.round(fine.amount * 100), // In cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&fine_id=${fine._id}`,
            cancel_url: `${clientUrl}/fines`,
            metadata: {
                fineId: fine._id.toString(),
                userId: req.user._id.toString(),
                type: 'fine'
            }
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify fine payment session
// @route   GET /api/fines/verify/:sessionId
// @access  Private
exports.verifyFinePayment = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const { fineId } = session.metadata;
            if (fineId) {
                const fine = await Fine.findById(fineId);
                if (fine && fine.status !== 'Paid') {
                    fine.status = 'Paid';
                    fine.paidAt = Date.now();
                    await fine.save();
                }
            }
            res.json({ status: 'Paid', success: true });
        } else {
            res.json({ status: session.payment_status, success: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
