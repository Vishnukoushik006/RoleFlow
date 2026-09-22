const Company = require('../models/Company');

/**
 * Normalizes company name and retrieves or creates the company document
 */
const getOrCreateCompany = async (companyData) => {
  if (!companyData || !companyData.name) return null;
  return await Company.findOrCreate(companyData);
};

module.exports = {
  getOrCreateCompany
};
