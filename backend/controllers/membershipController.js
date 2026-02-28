const MembershipPlan = require('../models/MembershipPlan');
const School = require('../models/registarSchoolModel');

// Create a new membership plan
const createPlan = async (req, res) => {
    try {
        const { name, price, durationInMonths, features } = req.body;

        // Validate required fields
        if (!name || price === undefined || !durationInMonths) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check for existing plan
        const existingPlan = await MembershipPlan.findOne({ name });
        if (existingPlan) {
            return res.status(400).json({ error: 'Plan with this name already exists' });
        }

        const plan = new MembershipPlan({
            name,
            price,
            durationInMonths,
            features: features || []
        });

        await plan.save();
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all plans
const getAllPlans = async (req, res) => {
    try {
        const plans = await MembershipPlan.find();
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a school's plan
const changePlan = async (req, res) => {
    try {
        const { schoolId, newPlanId } = req.body;

        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(schoolId) || !mongoose.Types.ObjectId.isValid(newPlanId)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const plan = await MembershipPlan.findById(newPlanId);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'School not found' });
        }

        // Calculate new dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + plan.durationInMonths);

        // Update school
        school.subscription = {
            plan: plan._id, // Store reference to plan
            paymentStatus: plan.price > 0 ? 'Pending' : 'Completed',
            startDate,
            endDate,
            trialEndDate: plan.name === 'Free' ? 
                new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) : null
        };

        await school.save();

        res.json({
            message: 'Plan updated successfully',
            school: await School.findById(schoolId)
                .populate('subscription.plan', 'name price durationInMonths')
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPlan,
    getAllPlans,
    changePlan
};