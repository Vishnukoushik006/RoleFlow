const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    logo: {
      type: String,
      trim: true,
      default: ''
    },
    domain: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    industry: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Static helper to find or create company cleanly without duplicate records
companySchema.statics.findOrCreate = async function (companyData) {
  if (!companyData || !companyData.name) return null;
  const rawName = companyData.name.trim();
  const normalized = rawName.toLowerCase();

  let company = await this.findOne({ normalizedName: normalized });
  if (!company) {
    let domain = '';
    let website = companyData.website || '';
    if (website) {
      try {
        const parsed = new URL(website.startsWith('http') ? website : `https://${website}`);
        domain = parsed.hostname.replace(/^www\./, '');
      } catch (err) {
        domain = '';
      }
    }

    // Auto-generate clearbit / favicon fallback logo if none provided
    let logo = companyData.logo || '';
    if (!logo && domain) {
      logo = `https://logo.clearbit.com/${domain}`;
    }

    company = await this.create({
      name: rawName,
      normalizedName: normalized,
      website: website || (domain ? `https://${domain}` : ''),
      logo: logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawName)}&background=6366f1&color=fff&bold=true`,
      domain,
      industry: companyData.industry || ''
    });
  } else {
    // Optionally update missing website or logo if new data provided
    if (!company.website && companyData.website) {
      company.website = companyData.website;
      await company.save();
    }
  }
  return company;
};

module.exports = mongoose.model('Company', companySchema);
