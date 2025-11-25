import ConceptNote from '../models/conceptNote.model.js';
import Campaign from '../models/campaign.model.js';
import { errorHandler } from '../utils/error.js';

// Requirement 8: Create Concept Note (Creative Staff only)
export const createConceptNote = async (req, res, next) => {
    try {
        const { campaignId, content, title } = req.body;

        // Validate required fields
        if (!campaignId || !content) {
            return res.status(400).json({
                success: false,
                error: 'Campaign ID and content are required'
            });
        }

        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        // Get the authenticated user's ID from the JWT token
        const createdByStaffId = req.user.id;

        // Create the concept note
        const newConceptNote = await ConceptNote.create({
            campaignId,
            content,
            title: title || `Concept Note for ${campaign.title}`,
            createdByStaffId
        });

        // Populate the creator information before returning
        const populatedNote = await ConceptNote.findById(newConceptNote._id)
            .populate('createdByStaffId', 'firstName lastName staffId isCreativeStaff')
            .populate('campaignId', 'title');

        res.status(201).json({
            success: true,
            message: 'Concept note created successfully',
            data: populatedNote
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Requirement 9: Get Concept Notes by Campaign (Any authenticated staff)
export const getConceptNotesByCampaign = async (req, res, next) => {
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

        // Retrieve all concept notes for this campaign
        const conceptNotes = await ConceptNote.find({ campaignId })
            .populate('createdByStaffId', 'firstName lastName staffId isCreativeStaff isManager isAccountant isAdmin')
            .populate('campaignId', 'title')
            .sort({ createdAt: -1 }); // Most recent first

        res.status(200).json({
            success: true,
            count: conceptNotes.length,
            data: conceptNotes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Additional: Get all concept notes (for admins/managers)
export const getAllConceptNotes = async (req, res, next) => {
    try {
        const conceptNotes = await ConceptNote.find()
            .populate('createdByStaffId', 'firstName lastName staffId isCreativeStaff isManager isAccountant isAdmin')
            .populate('campaignId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: conceptNotes.length,
            data: conceptNotes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Additional: Update Concept Note (Creator or Admin only)
export const updateConceptNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content, title } = req.body;

        const conceptNote = await ConceptNote.findById(id);
        
        if (!conceptNote) {
            return res.status(404).json({
                success: false,
                error: 'Concept note not found'
            });
        }

        // Check if user is the creator or an admin
        if (conceptNote.createdByStaffId.toString() !== req.user.id && !req.user.isAdmin) {
            return next(errorHandler(403, 'Access denied - You can only update your own concept notes'));
        }

        const updatedConceptNote = await ConceptNote.findByIdAndUpdate(
            id,
            { content, title },
            { new: true, runValidators: true }
        )
            .populate('createdByStaffId', 'firstName lastName staffId isCreativeStaff')
            .populate('campaignId', 'title');

        res.status(200).json({
            success: true,
            message: 'Concept note updated successfully',
            data: updatedConceptNote
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Additional: Delete Concept Note (Creator or Admin only)
export const deleteConceptNote = async (req, res, next) => {
    try {
        const { id } = req.params;

        const conceptNote = await ConceptNote.findById(id);
        
        if (!conceptNote) {
            return res.status(404).json({
                success: false,
                error: 'Concept note not found'
            });
        }

        // Check if user is the creator or an admin
        if (conceptNote.createdByStaffId.toString() !== req.user.id && !req.user.isAdmin) {
            return next(errorHandler(403, 'Access denied - You can only delete your own concept notes'));
        }

        await ConceptNote.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Concept note deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

