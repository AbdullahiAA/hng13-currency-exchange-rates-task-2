const axios = require("axios");

class ExchangeRateService {
  /**
   * Fetches the latest exchange rates from the Exchange Rate API.
   * Returns the result in the standard Exchange Rate API response format, which includes properties like:
   * - result (string): The status of the response
   * - provider (string): API provider's base URL
   * - documentation (string): Link to the API documentation
   * - terms_of_use (string): Link to terms of use
   * - time_last_update_unix (number): Last update time (unix timestamp)
   * - time_last_update_utc (string): Last update time (UTC string)
   * - time_next_update_unix (number): Next update time (unix timestamp)
   * - time_next_update_utc (string): Next update time (UTC string)
   * - time_eol_unix (number): End-of-life unix timestamp for the current endpoint
   * - base_code (string): The base currency code
   * - rates (object): key/value map of currency codes and rates
   * @returns {Promise<object>} The exchange rates in the documented API response format
   */
  static async getExchangeRate() {
    try {
      const response = await axios.get(process.env.EXCHANGE_RATE_API_URL, {
        timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT) || 10000,
      });

      return response?.data;
    } catch (error) {
      console.error("Error fetching exchange rate:", error?.message);
      throw new Error("Exchange Rate API");
    }
  }
}

module.exports = ExchangeRateService;
