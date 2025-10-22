import Client from '../models/client.model.js';
import Campaign from '../models/campaign.model.js';
import { errorHandler } from '../utils/error.js';

export const createClient = async (req, res, next) => {
    // Only Admin or Manager can create clients
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try {
        const newClient = await Client.create(req.body);

        res.status(201).json({
            success: true,
            data: newClient
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export const getClients = async (req, res, next) => {
    /*     try{
            const clients = await Client.find();
    
            res.status(200).json({
                success: true,
                data: clients
            });
    
        }catch(error){
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
     */
    try {
        const clients = await Client.find();

        const clientsWithCampaignCount = await Promise.all(
            clients.map(async (client) => {
                const campaignCount = await Campaign.countDocuments({ clientId: client._id });
                return {
                    ...client._doc,
                    campaignCount: campaignCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: clientsWithCampaignCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export const updateClient = async (req, res, next) => {
    // Only Admin or Manager can update clients
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        const updatedClient = await Client.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedClient
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

export const deleteClient = async (req, res, next) => {
    // Only Admin or Manager can delete clients
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                error: 'Client not found'
            });
        }

        await Client.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Client deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export const getTotalCampaignNumberOfClients = async (req, res, next) => {
    try {
        const clients = await Client.find();

        // Her client için campaign sayısını hesapla
        const clientsWithCampaignCount = await Promise.all(
            clients.map(async (client) => {
                const campaignCount = await Campaign.countDocuments({ clientId: client._id });
                return {
                    clientId: client._id,
                    clientName: `${client.name} ${client.surname}`,
                    companyName: client.companyName,
                    email: client.email,
                    campaignCount: campaignCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: clientsWithCampaignCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}