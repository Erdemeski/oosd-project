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
        // Body'den schedules da gelebilir, onu da alıyoruz
        const { campaignId, title, description, platform, estimatedCost, schedules } = req.body;

        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return next(errorHandler(404, 'Campaign not found'));
        }

        let newAdvert = await Advert.create({
            campaignId,
            title,
            description,
            platform,
            estimatedCost,
            schedules: schedules || [], // Eğer schedule gelmezse boş dizi ata
            createdByStaffId: req.user.id
        });

        newAdvert = await newAdvert.populate('campaignId', 'title budget').populate('createdByStaffId', 'firstName lastName staffId');

        res.status(201).json({
            success: true,
            message: 'Advertisement created successfully',
            data: newAdvert
        });

    } catch (error) {
        next(error);
    }
};

// Get all adverts
export const getAllAdverts = async (req, res, next) => {
    try {
        const adverts = await Advert.find()
            .populate('campaignId', 'title budget')
            .populate('createdByStaffId', 'firstName lastName staffId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: adverts.length,
            data: adverts
        });

    } catch (error) {
        next(error);
    }
};

// Get adverts by campaign
export const getAdvertsByCampaign = async (req, res, next) => {
    try {
        const { campaignId } = req.params;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return next(errorHandler(404, 'Campaign not found'));
        }

        const adverts = await Advert.find({ campaignId })
            .populate('campaignId', 'title budget')
            .populate('createdByStaffId', 'firstName lastName staffId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: adverts.length,
            data: adverts
        });

    } catch (error) {
        next(error);
    }
};

// Get single advert
export const getAdvertById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const advert = await Advert.findById(id)
            .populate('campaignId', 'title budget')
            .populate('createdByStaffId', 'firstName lastName staffId');

        if (!advert) {
            return next(errorHandler(404, 'Advertisement not found'));
        }

        res.status(200).json({
            success: true,
            data: advert
        });

    } catch (error) {
        next(error);
    }
};

// Update advert (Genel güncelleme)
export const updateAdvert = async (req, res, next) => {
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try {
        const { id } = req.params;

        // Eğer campaignId değişiyorsa, yeni kampanya var mı kontrol et
        if (req.body.campaignId) {
            const campaign = await Campaign.findById(req.body.campaignId);
            if (!campaign) {
                return next(errorHandler(404, 'Campaign not found'));
            }
        }

        const updatedAdvert = await Advert.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).populate('campaignId', 'title budget')
         .populate('createdByStaffId', 'firstName lastName staffId');

        if (!updatedAdvert) {
            return next(errorHandler(404, 'Advertisement not found'));
        }

        res.status(200).json({
            success: true,
            message: 'Advertisement updated successfully',
            data: updatedAdvert
        });

    } catch (error) {
        next(error);
    }
};

// Delete advert
export const deleteAdvert = async (req, res, next) => {
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied - Admin or Manager privileges required'));
    }

    try {
        const { id } = req.params;

        const deletedAdvert = await Advert.findByIdAndDelete(id);

        if (!deletedAdvert) {
            return next(errorHandler(404, 'Advertisement not found'));
        }

        res.status(200).json({
            success: true,
            message: 'Advertisement deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// Update actual cost (Requirements 8/9 - Muhasebe/Yönetici)
export const updateActualCost = async (req, res, next) => {
    // Accountant, Admin, or Manager can update actual costs
    if (!req.user.isAccountant && !req.user.isAdmin && !req.user.isManager) {
        return next(errorHandler(403, 'Access denied - Accountant, Admin, or Manager privileges required'));
    }

    try {
        const { id } = req.params;
        const { actualCost } = req.body;

        if (actualCost === undefined || actualCost < 0) {
            return next(errorHandler(400, 'Valid actual cost is required'));
        }

        const advert = await Advert.findByIdAndUpdate(
            id,
            { actualCost: actualCost },
            { new: true, runValidators: true }
        ).populate('campaignId', 'title budget')
         .populate('createdByStaffId', 'firstName lastName staffId');

        if (!advert) {
            return next(errorHandler(404, 'Advertisement not found'));
        }

        res.status(200).json({
            success: true,
            message: 'Actual cost updated successfully',
            data: advert
        });

    } catch (error) {
        next(error);
    }
};

// Add Schedule to Advert (Madde 11 - Main dalındaki özellik)
export const addScheduleToAdvert = async (req, res, next) => {
    // Sadece Admin veya Manager yayın planı ekleyebilir
    if (req.user.isAdmin !== true && req.user.isManager !== true) {
        return next(errorHandler(403, 'Access denied'));
    }

    try {
        const { id } = req.params;
        const { channel, startDate, endDate, cost } = req.body;

        const advert = await Advert.findById(id);
        if (!advert) {
            return next(errorHandler(404, 'Advertisement not found'));
        }

        // Yeni schedule objesi oluştur ve array'e push et
        advert.schedules.push({ 
            channel, 
            startDate, 
            endDate, 
            cost: cost || 0 
        });
        
        // Eğer schedule'ın bir maliyeti varsa ve estimatedCost 0 ise,
        // otomatik olarak estimatedCost'u da güncelleyebiliriz (opsiyonel mantık)
        // advert.estimatedCost += (cost || 0); 

        const updatedAdvert = await advert.save();
        await updatedAdvert.populate('campaignId', 'title budget');
        await updatedAdvert.populate('createdByStaffId', 'firstName lastName staffId');

        res.status(200).json({
            success: true,
            message: 'Schedule added successfully',
            data: updatedAdvert
        });

    } catch (error) {
        next(error);
    }
};