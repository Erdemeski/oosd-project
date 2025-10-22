import Campaign from '../models/campaign.model.js';
import Client from '../models/client.model.js';
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

