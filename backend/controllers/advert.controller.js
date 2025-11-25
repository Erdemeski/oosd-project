import Advert from '../models/advert.model.js';
import Campaign from '../models/campaign.model.js';
import { errorHandler } from '../utils/error.js';

// Create a new advert
export const createAdvert = async (req, res, next) => {
    // Only Admin or Manager can create adverts
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try {
        const { campaignId } = req.body;

        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        const newAdvert = await Advert.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Advertisement created successfully',
            data: newAdvert
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all adverts
export const getAllAdverts = async (req, res, next) => {
    try {
        const adverts = await Advert.find()
            .populate('campaignId', 'title budget')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: adverts.length,
            data: adverts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get adverts by campaign
export const getAdvertsByCampaign = async (req, res, next) => {
    try {
        const { campaignId } = req.params;

        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        const adverts = await Advert.find({ campaignId })
            .populate('campaignId', 'title budget')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: adverts.length,
            data: adverts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single advert
export const getAdvertById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const advert = await Advert.findById(id)
            .populate('campaignId', 'title budget');

        if (!advert) {
            return res.status(404).json({
                success: false,
                error: 'Advertisement not found'
            });
        }

        res.status(200).json({
            success: true,
            data: advert
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update advert
export const updateAdvert = async (req, res, next) => {
    // Only Admin or Manager can update adverts
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try {
        const { id } = req.params;

        const advert = await Advert.findById(id);
        if (!advert) {
            return res.status(404).json({
                success: false,
                error: 'Advertisement not found'
            });
        }

        // If campaignId is being updated, verify the campaign exists
        if (req.body.campaignId) {
            const campaign = await Campaign.findById(req.body.campaignId);
            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    error: 'Campaign not found'
                });
            }
        }

        const updatedAdvert = await Advert.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).populate('campaignId', 'title budget');

        res.status(200).json({
            success: true,
            message: 'Advertisement updated successfully',
            data: updatedAdvert
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete advert
export const deleteAdvert = async (req, res, next) => {
    // Only Admin or Manager can delete adverts
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try {
        const { id } = req.params;

        const advert = await Advert.findById(id);
        if (!advert) {
            return res.status(404).json({
                success: false,
                error: 'Advertisement not found'
            });
        }

        await Advert.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Advertisement deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update actual cost (Accountant can also do this)
export const updateActualCost = async (req, res, next) => {
    // Accountant, Admin, or Manager can update actual costs
    if (!req.user.isAccountant && !req.user.isAdmin && !req.user.isManager) {
        return next(errorHandler(403, 'Access denied - Accountant, Admin, or Manager privileges required'));
    }

    try {
        const { id } = req.params;
        const { actualCost } = req.body;

        if (actualCost === undefined || actualCost < 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid actual cost is required'
            });
        }

        const advert = await Advert.findById(id);
        if (!advert) {
            return res.status(404).json({
                success: false,
                error: 'Advertisement not found'
            });
        }

        advert.actualCost = actualCost;
        await advert.save();

        const updatedAdvert = await Advert.findById(id)
            .populate('campaignId', 'title budget');

        res.status(200).json({
            success: true,
            message: 'Actual cost updated successfully',
            data: updatedAdvert
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

