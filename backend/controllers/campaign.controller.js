import Campaign from '../models/campaign.model.js';
import Client from '../models/client.model.js';

export const createCampaign = async (req, res, next) => {
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
        });// eğer kayıt başarılı ise 201 döndürecek
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

