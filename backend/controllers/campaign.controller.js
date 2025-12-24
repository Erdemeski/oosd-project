import OpenAI from 'openai';
import Campaign from '../models/campaign.model.js';
import Client from '../models/client.model.js';
import Advert from '../models/advert.model.js';
import ConceptNote from '../models/conceptNote.model.js';
import { errorHandler } from '../utils/error.js';

const getOpenAIClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const extractJsonPayload = (content) => {
    if (!content) return null;
    const fenceMatch = content.match(/```json\s*([\s\S]*?)```/i);
    if (fenceMatch?.[1]) return fenceMatch[1].trim();
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
    return content.slice(firstBrace, lastBrace + 1).trim();
};

const summarizeCost = (advert) => {
    const actualCost = Number(advert.actualCost || 0);
    const estimatedCost = Number(advert.estimatedCost || 0);
    return actualCost > 0 ? actualCost : estimatedCost;
};

const formatNumber = (value) => {
    if (!Number.isFinite(value)) return '0';
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const buildFallbackSummary = ({
    campaign,
    conceptNotes,
    adverts,
    budgetStatus,
    totalAdvertCost,
    remainingBudget,
    budgetUsagePercentage,
    statusCounts,
    scheduleCount
}) => {
    const highlights = [];
    const risks = [];
    const nextActions = [];
    let conceptSummary = 'No concept notes captured yet.';

    highlights.push(`${conceptNotes.length} concept notes and ${adverts.length} adverts tracked.`);

    if (campaign.budget > 0) {
        const usageLabel = budgetUsagePercentage !== null ? `${budgetUsagePercentage.toFixed(2)}%` : 'n/a';
        highlights.push(`Spend: $${formatNumber(totalAdvertCost)} of $${formatNumber(campaign.budget)} (${usageLabel}).`);
    } else {
        highlights.push(`Spend tracked at $${formatNumber(totalAdvertCost)} with no budget set.`);
    }

    if (Object.keys(statusCounts).length > 0) {
        const statusSummary = Object.entries(statusCounts)
            .map(([status, count]) => `${status}: ${count}`)
            .join(', ');
        highlights.push(`Advert status mix: ${statusSummary}.`);
    }

    if (scheduleCount > 0) {
        highlights.push(`${scheduleCount} publishing schedule items defined.`);
    }

    if (budgetStatus === 'Over Budget') {
        risks.push(`Campaign is over budget by $${formatNumber(Math.abs(remainingBudget))}.`);
    } else if (budgetStatus === 'Warning - Near Budget Limit') {
        risks.push(`Campaign budget is nearly depleted with $${formatNumber(remainingBudget)} remaining.`);
    }

    if (conceptNotes.length === 0) {
        risks.push('No concept notes captured yet, which can slow creative alignment.');
    }
    if (adverts.length === 0) {
        risks.push('No adverts created yet for this campaign.');
    }

    if (budgetStatus !== 'Within Budget' && campaign.budget > 0) {
        nextActions.push('Review high-cost adverts and adjust spend to protect budget.');
    }
    if (scheduleCount === 0) {
        nextActions.push('Add publishing schedules to lock delivery dates.');
    }
    if (conceptNotes.length === 0) {
        nextActions.push('Add at least one concept note to guide creative production.');
    }
    if (nextActions.length === 0) {
        nextActions.push('Confirm advert statuses and align next steps with the plan.');
    }

    if (conceptNotes.length > 0) {
        const conceptTitles = conceptNotes
            .map((note) => note.title)
            .filter(Boolean)
            .slice(0, 3);
        if (conceptTitles.length > 0) {
            conceptSummary = `Focused concept areas: ${conceptTitles.join(', ')}.`;
        } else {
            const firstSnippet = String(conceptNotes[0]?.content || '').replace(/\s+/g, ' ').slice(0, 120);
            conceptSummary = firstSnippet
                ? `Latest concept brief: ${firstSnippet}`
                : 'Concept notes are available.';
        }
    }

    return {
        summary: `Campaign ${campaign.title} is ${budgetStatus.toLowerCase()}. ${conceptNotes.length} concepts and ${adverts.length} adverts are in the pipeline.`,
        conceptSummary,
        highlights,
        risks,
        nextActions
    };
};

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

export const generateCampaignOperationsSummary = async (req, res, next) => {
    try {
        const { campaignId } = req.params;

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API key is not configured'
            });
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        const [conceptNotes, adverts] = await Promise.all([
            ConceptNote.find({ campaignId }).sort({ createdAt: -1 }),
            Advert.find({ campaignId }).sort({ createdAt: -1 })
        ]);

        const totalAdvertCost = adverts.reduce((total, advert) => total + summarizeCost(advert), 0);
        const totalEstimatedCost = adverts.reduce((total, advert) => total + Number(advert.estimatedCost || 0), 0);
        const totalActualCost = adverts.reduce((total, advert) => total + Number(advert.actualCost || 0), 0);
        const scheduleCount = adverts.reduce((total, advert) => total + (advert.schedules?.length || 0), 0);
        const budgetUsagePercentage = campaign.budget > 0 ? (totalAdvertCost / campaign.budget) * 100 : null;
        const remainingBudget = campaign.budget - totalAdvertCost;
        let budgetStatus = 'No Budget Set';

        if (campaign.budget > 0) {
            if (totalAdvertCost <= campaign.budget * 0.8) {
                budgetStatus = 'Within Budget';
            } else if (totalAdvertCost <= campaign.budget) {
                budgetStatus = 'Warning - Near Budget Limit';
            } else {
                budgetStatus = 'Over Budget';
            }
        }

        const statusCounts = adverts.reduce((counts, advert) => {
            const status = advert.status || 'Unknown';
            counts[status] = (counts[status] || 0) + 1;
            return counts;
        }, {});

        const topAdverts = [...adverts]
            .sort((a, b) => summarizeCost(b) - summarizeCost(a))
            .slice(0, 3)
            .map((advert) => ({
                title: advert.title,
                status: advert.status,
                cost: summarizeCost(advert),
                platform: advert.platform || '—'
            }));

        const conceptSamples = conceptNotes.slice(0, 3).map((note) => ({
            title: note.title || 'Untitled Concept',
            estimatedBudget: note.estimatedBudget ?? null,
            snippet: String(note.content || '').replace(/\s+/g, ' ').slice(0, 140)
        }));

        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const openaiClient = getOpenAIClient();

        const systemMessage = `You are a campaign operations analyst. Provide a concise, executive-ready summary.
Return JSON only with shape:
{"summary":"...", "conceptSummary":"...", "highlights":["..."], "risks":["..."], "nextActions":["..."]}
Keep summary under 80 words. Provide conceptSummary in 1-2 sentences that start with "Focused concept areas:" and list the concept titles. Use 3-5 highlights, 1-3 risks, 2-4 next actions.`;

        const payload = {
            campaign: {
                title: campaign.title,
                budget: campaign.budget,
                estimatedCost: campaign.estimatedCost,
                plannedStartDate: campaign.plannedStartDate,
                plannedEndDate: campaign.plannedEndDate
            },
            budget: {
                totalAdvertCost,
                remainingBudget,
                budgetUsagePercentage: budgetUsagePercentage ? Number(budgetUsagePercentage.toFixed(2)) : null,
                budgetStatus
            },
            concepts: {
                count: conceptNotes.length,
                samples: conceptSamples
            },
            adverts: {
                count: adverts.length,
                statusCounts,
                totalEstimatedCost,
                totalActualCost,
                scheduleCount,
                topAdverts
            }
        };

        const completion = await openaiClient.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: `Campaign data:\n${JSON.stringify(payload)}` }
            ],
            temperature: 1,
            max_completion_tokens: 500
        });

        const content = completion?.choices?.[0]?.message?.content || '';
        const jsonPayload = extractJsonPayload(content);
        if (!jsonPayload) {
            const fallback = buildFallbackSummary({
                campaign,
                conceptNotes,
                adverts,
                budgetStatus,
                totalAdvertCost,
                remainingBudget,
                budgetUsagePercentage,
                statusCounts,
                scheduleCount
            });
            return res.status(200).json({
                success: true,
                data: fallback
            });
        }

        let parsed;
        try {
            parsed = JSON.parse(jsonPayload);
        } catch (error) {
            const fallback = buildFallbackSummary({
                campaign,
                conceptNotes,
                adverts,
                budgetStatus,
                totalAdvertCost,
                remainingBudget,
                budgetUsagePercentage,
                statusCounts,
                scheduleCount
            });
            return res.status(200).json({
                success: true,
                data: fallback
            });
        }

        const summary = String(parsed?.summary || '').trim();
        const conceptSummary = String(parsed?.conceptSummary || '').trim();
        const highlights = Array.isArray(parsed?.highlights) ? parsed.highlights : [];
        const risks = Array.isArray(parsed?.risks) ? parsed.risks : [];
        const nextActions = Array.isArray(parsed?.nextActions) ? parsed.nextActions : [];
        const fallback = buildFallbackSummary({
            campaign,
            conceptNotes,
            adverts,
            budgetStatus,
            totalAdvertCost,
            remainingBudget,
            budgetUsagePercentage,
            statusCounts,
            scheduleCount
        });
        const payloadData = {
            summary: summary || fallback.summary,
            conceptSummary: conceptSummary || fallback.conceptSummary,
            highlights: highlights.length ? highlights : fallback.highlights,
            risks: risks.length ? risks : fallback.risks,
            nextActions: nextActions.length ? nextActions : fallback.nextActions
        };

        res.status(200).json({
            success: true,
            data: payloadData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
