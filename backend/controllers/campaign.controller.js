import Campaign from '../models/campaign.model.js';
import Client from '../models/client.model.js';
import Advert from '../models/advert.model.js';
import { errorHandler } from '../utils/error.js';

export const createCampaign = async (req, res, next) => {
    // Only Admin or Manager can create campaigns
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try {
        const {clientId} = req.body;
        const isClientExist = await Client.findById(clientId);

        if(!isClientExist){
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        const newCampaign = await Campaign.create(req.body);

        res.status(201).json({
            success: true,
            data: newCampaign
        });
    }catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const getCampaigns = async (req, res, next) => {
    try{
        const campaigns = await Campaign.find();
        res.status(200).json({
            success: true,
            data: campaigns
        });
    }catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export const updateCampaign = async (req, res, next) => {
    // Only Admin or Manager can update campaigns
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try{
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        // If clientId is being updated, verify the client exists
        if (req.body.clientId) {
            const isClientExist = await Client.findById(req.body.clientId);
            if (!isClientExist) {
                return res.status(404).json({
                    success: false,
                    error: 'Client not found'
                });
            }
        }

        const updatedCampaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedCampaign
        });

    }catch(error){
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export const deleteCampaign = async (req, res, next) => {
    // Only Admin or Manager can delete campaigns
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try{
        const campaign = await Campaign.findById(req.params.id);
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        await Campaign.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Campaign deleted successfully'
        });

    }catch(error){
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Requirement 7: Budget and Status Check for Accountants
export const checkCampaignBudgetAndStatus = async (req, res, next) => {
    try {
        const { campaignId } = req.params;

        // Retrieve the campaign
        const campaign = await Campaign.findById(campaignId);
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        // Find all adverts linked to this campaign
        const adverts = await Advert.find({ campaignId: campaignId });

        // Calculate total advert costs
        // Priority: actualCost if available, otherwise estimatedCost
        const totalAdvertCost = adverts.reduce((total, advert) => {
            const cost = advert.actualCost > 0 ? advert.actualCost : advert.estimatedCost;
            return total + cost;
        }, 0);

        // Determine budget status
        let budgetStatus;
        const budgetUsagePercentage = (totalAdvertCost / campaign.budget) * 100;

        if (totalAdvertCost <= campaign.budget * 0.8) {
            budgetStatus = 'Within Budget';
        } else if (totalAdvertCost <= campaign.budget) {
            budgetStatus = 'Warning - Near Budget Limit';
        } else {
            budgetStatus = 'Over Budget';
        }

        // Return comprehensive budget information
        res.status(200).json({
            success: true,
            data: {
                campaignId: campaign._id,
                campaignTitle: campaign.title,
                campaignBudget: campaign.budget,
                totalAdvertCost: totalAdvertCost,
                remainingBudget: campaign.budget - totalAdvertCost,
                budgetUsagePercentage: budgetUsagePercentage.toFixed(2),
                budgetStatus: budgetStatus,
                numberOfAdverts: adverts.length,
                plannedStartDate: campaign.plannedStartDate,
                plannedEndDate: campaign.plannedEndDate
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

