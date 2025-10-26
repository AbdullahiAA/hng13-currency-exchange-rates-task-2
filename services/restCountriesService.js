const axios = require("axios");

class RestCountriesService {
  /**
   * Fetches all countries from the REST Countries API and returns them as an array
   * of objects in the expected response format, including name, capital, region,
   * population, currencies, flag, and independent fields.
   * @returns {Promise<Array>} Array of country objects
   */
  static async getCountries() {
    try {
      const response = await axios.get(process.env.REST_COUNTRIES_API_URL, {
        timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT) || 10000,
      });

      return response?.data;
    } catch (error) {
      console.error("Error fetching countries:", error?.message);
      throw new Error("REST Countries API");
    }
  }
}

module.exports = RestCountriesService;
