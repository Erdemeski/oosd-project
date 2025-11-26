import Advert from '../models/advert.model.js';
// Eğer Campaign modelin varsa onu da böyle import etmen lazım:
// import Campaign from '../models/campaign.model.js'; 

// 1. Yeni Reklam Oluşturma
export const createAdvert = async (req, res) => {
  try {
    const { campaignId, title, description, estimatedCost, scheduleDates } = req.body;

    // Not: Campaign kontrolü yapacaksan Campaign modelini import etmelisin.
    // Şimdilik hatayı çözmek için sadece oluşturma kısmını yazıyorum.
    
    const newAdvert = new Advert({
      campaignId,
      title,
      description,
      estimatedCost,
      scheduleDates
    });

    const savedAdvert = await newAdvert.save();
    res.status(201).json(savedAdvert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Kampanyaya ait reklamları getirme
export const getAdvertsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const adverts = await Advert.find({ campaignId: campaignId });
    res.status(200).json(adverts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Reklam Güncelleme
export const updateAdvert = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedAdvert = await Advert.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedAdvert) {
      return res.status(404).json({ message: "Reklam bulunamadı" });
    }
    res.status(200).json(updatedAdvert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Schedule Ekleme (Madde 11)
export const addScheduleToAdvert = async (req, res) => {
  try {
    const { id } = req.params;
    const { channel, startDate, endDate, cost } = req.body;

    const advert = await Advert.findById(id);
    if (!advert) {
      return res.status(404).json({ message: "Reklam bulunamadı." });
    }

    const newSchedule = { channel, startDate, endDate, cost };
    advert.schedules.push(newSchedule);
    
    const updatedAdvert = await advert.save();
    res.status(200).json(updatedAdvert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};