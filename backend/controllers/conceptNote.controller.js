import OpenAI from 'openai';
import ConceptNote from '../models/conceptNote.model.js';
import Campaign from '../models/campaign.model.js';
import { errorHandler } from '../utils/error.js';

const getOpenAIClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getBaseBudget = (campaign) => {
    const budget = Number(campaign?.budget);
    if (Number.isFinite(budget) && budget > 0) return budget;
    const estimatedCost = Number(campaign?.estimatedCost);
    if (Number.isFinite(estimatedCost) && estimatedCost > 0) return estimatedCost;
    return 10000;
};

const estimateIdeaBudget = (baseBudget, wordCount, index) => {
    const intensity = clamp(wordCount / 90, 0.05, 0.15);
    const multiplier = clamp(intensity + index * 0.03, 0.06, 0.22);
    const raw = baseBudget * multiplier;
    const rounded = Math.round(raw / 100) * 100;
    return Math.max(500, rounded);
};

const extractJsonPayload = (content) => {
    if (!content) return null;
    const fenceMatch = content.match(/```json\s*([\s\S]*?)```/i);
    if (fenceMatch?.[1]) return fenceMatch[1].trim();
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
    return content.slice(firstBrace, lastBrace + 1).trim();
};

const parseJsonPayload = (content) => {
    const jsonPayload = extractJsonPayload(content);
    if (!jsonPayload) return null;
    try {
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

const isOutOfScopeResponse = (parsed) => {
    if (parsed?.outOfScope === true) return true;
    const ideas = Array.isArray(parsed?.ideas) ? parsed.ideas : [];
    if (ideas.length !== 1) return false;
    const title = String(ideas[0]?.title || '').toLowerCase();
    const summary = String(ideas[0]?.summary || '').toLowerCase();
    return title.includes('out of scope') || summary.includes('only help generate campaign concept');
};

const getScopeGuardMessages = (prompt) => {
    const systemMessage = `You are a strict scope guard for an advertising campaign concept ideation tool.
Approve only prompts that clearly ask for campaign/marketing/advertising/branding concept ideas.
In-scope prompts must mention at least one of these exact words: campaign, bmarketing, advert, brand, concept, idea, creative, promotion, product, mediacontent, social.
If the prompt is not clearly about campaign concept ideation, return outOfScope true.
If the prompt is ambiguous or just a general question (e.g., sports or trivia without marketing context), return outOfScope true.
Return JSON only:
{"outOfScope":true,"reason":"..."} or {"outOfScope":false,"reason":"..."}
Examples of outOfScope:
- "kim en iyi basketbol oyuncusu sence dünyada"
- "who won the last world cup"
- "tell me about basketball rules"
- "best player in football history"
Examples of in scope:
- "campaign ideas to launch a new running shoe"
- "marketing concept for a summer beverage promotion"
- "advertising ideas for a new phone brand"
- "creative social media concept for a product launch"`;

    const userMessage = `Prompt: ${prompt}`;

    return [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
    ];
};

const normalizeChannels = (channels) => {
    if (Array.isArray(channels)) {
        return channels
            .map((channel) => String(channel || '').trim())
            .filter(Boolean)
            .slice(0, 6);
    }
    if (typeof channels === 'string') {
        return channels
            .split(',')
            .map((channel) => channel.trim())
            .filter(Boolean)
            .slice(0, 6);
    }
    return [];
};

const normalizeIdeas = ({ ideas, campaignTitle, baseBudget, promptWordCount }) => {
    const minBudget = Math.max(500, Math.round(baseBudget * 0.05));
    const maxBudget = Math.max(minBudget, Math.round(baseBudget * 0.3));

    return ideas.slice(0, 3).map((idea, index) => {
        const title = String(idea?.title || `Idea ${index + 1} for ${campaignTitle}`).trim();
        const summary = String(idea?.summary || '').trim();
        const channels = normalizeChannels(idea?.channels);
        const proposedBudget = Number(idea?.estimatedBudget);
        const fallbackBudget = estimateIdeaBudget(baseBudget, promptWordCount, index);
        let finalBudget = fallbackBudget;

        if (Number.isFinite(proposedBudget)) {
            finalBudget = clamp(Math.round(proposedBudget / 100) * 100, minBudget, maxBudget);
        }

        return {
            id: `${campaignTitle}-${index}`,
            title,
            summary,
            channels,
            estimatedBudget: finalBudget
        };
    });
};

// Requirement 8: Create Concept Note (Creative Staff only)
export const createConceptNote = async (req, res, next) => {
    try {
        const { campaignId, content, title, estimatedBudget } = req.body;

        // Validate required fields
        if (!campaignId || !content) {
            return res.status(400).json({
                success: false,
                error: 'Campaign ID and content are required'
            });
        }

        const hasEstimatedBudget = estimatedBudget !== undefined && estimatedBudget !== null && estimatedBudget !== '';
        const parsedEstimatedBudget = hasEstimatedBudget ? Number(estimatedBudget) : null;
        if (hasEstimatedBudget && (!Number.isFinite(parsedEstimatedBudget) || parsedEstimatedBudget < 0)) {
            return res.status(400).json({
                success: false,
                error: 'Estimated budget must be a positive number'
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
            createdByStaffId,
            ...(hasEstimatedBudget ? { estimatedBudget: parsedEstimatedBudget } : {})
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

export const generateConceptIdeas = async (req, res, next) => {
    try {
        const { campaignId, prompt, titleHint } = req.body;

        if (!campaignId || !prompt) {
            return res.status(400).json({
                success: false,
                error: 'Campaign and prompt are required'
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'OpenAI API key is not configured'
            });
        }

        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const openaiClient = getOpenAIClient();
        const scopeGuard = await openaiClient.chat.completions.create({
            model,
            messages: getScopeGuardMessages(prompt)
        });
        const scopeContent = scopeGuard?.choices?.[0]?.message?.content || '';
        const scopeParsed = parseJsonPayload(scopeContent);
        if (!scopeParsed || typeof scopeParsed.outOfScope !== 'boolean') {
            return res.status(502).json({
                success: false,
                error: 'AI scope check did not return valid JSON'
            });
        }
        if (scopeParsed.outOfScope) {
            const reason = String(scopeParsed.reason || '').trim();
            return res.status(400).json({
                success: false,
                error: reason || 'I can only help generate campaign concept ideas. Please share a campaign-focused prompt.'
            });
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        const baseBudget = getBaseBudget(campaign);
        const promptWordCount = String(prompt).trim().split(/\s+/).filter(Boolean).length;

        const systemMessage = `You are a creative strategist. Generate three distinct campaign concept note ideas.
Return JSON only with shape:
{"outOfScope":false,"ideas":[{"title":"...","summary":"...","channels":["..."],"estimatedBudget":12345}]}
Each summary should be 2-3 sentences. Include 3-5 channels. Budgets should be realistic in USD.
If the prompt is not about campaign concept ideation (e.g., sports topics without advertising, branding, or marketing context), return:
{"outOfScope":true,"ideas":[{"title":"Out of scope request","summary":"I can only help generate campaign concept ideas. Please share a campaign-focused prompt.","channels":[],"estimatedBudget":null}]}`;

        const userMessage = `Campaign: ${campaign.title}
Campaign budget: ${campaign.budget ?? 'unknown'}
Campaign estimated cost: ${campaign.estimatedCost ?? 'unknown'}
Title hint: ${titleHint || 'none'}
Prompt: ${prompt}
Budget guidance: keep estimatedBudget between 5% and 30% of campaign budget when budget is known.`;

        const completion = await openaiClient.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userMessage }
            ],
            temperature: 1
        });

        const content = completion?.choices?.[0]?.message?.content || '';
        const parsed = parseJsonPayload(content);
        if (!parsed) {
            return res.status(502).json({
                success: false,
                error: 'AI response was not valid JSON'
            });
        }

        if (isOutOfScopeResponse(parsed)) {
            const ideas = Array.isArray(parsed?.ideas) ? parsed.ideas : [];
            const fallbackMessage = 'I can only help generate campaign concept ideas. Please share a campaign-focused prompt.';
            const message = String(ideas[0]?.summary || '').trim() || fallbackMessage;
            return res.status(400).json({
                success: false,
                error: message
            });
        }

        const ideas = Array.isArray(parsed?.ideas) ? parsed.ideas : [];
        if (ideas.length === 0) {
            return res.status(502).json({
                success: false,
                error: 'AI response did not include ideas'
            });
        }

        const normalizedIdeas = normalizeIdeas({
            ideas,
            campaignTitle: campaign.title,
            baseBudget,
            promptWordCount
        });

        res.status(200).json({
            success: true,
            data: normalizedIdeas
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
        const { content, title, estimatedBudget } = req.body;

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

        const updatePayload = { content, title };
        const hasEstimatedBudget = estimatedBudget !== undefined && estimatedBudget !== null && estimatedBudget !== '';
        if (hasEstimatedBudget) {
            const parsedEstimatedBudget = Number(estimatedBudget);
            if (!Number.isFinite(parsedEstimatedBudget) || parsedEstimatedBudget < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Estimated budget must be a positive number'
                });
            }
            updatePayload.estimatedBudget = parsedEstimatedBudget;
        }

        const updatedConceptNote = await ConceptNote.findByIdAndUpdate(
            id,
            updatePayload,
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
