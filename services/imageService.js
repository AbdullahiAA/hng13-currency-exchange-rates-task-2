const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

class ImageService {
  /**
   * Generates a summary image with total countries, top 5 by GDP, and last refresh timestamp
   * @param {Object} options - Configuration options
   * @param {number} options.totalCountries - Total number of countries
   * @param {Array} options.topCountries - Array of top countries by GDP
   * @param {string} options.lastRefreshedAt - Timestamp of last refresh
   * @param {string} options.outputPath - Path to save the image
   * @returns {Promise<void>}
   */
  static async generateSummaryImage({
    totalCountries,
    topCountries,
    lastRefreshedAt,
    outputPath,
  }) {
    try {
      // Create canvas
      const width = 800;
      const height = 600;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Set background color
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, width, height);

      // Add border
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Title
      ctx.fillStyle = "#2c3e50";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Countries Summary", width / 2, 60);

      // Total countries
      ctx.fillStyle = "#3498db";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`Total Countries: ${totalCountries}`, 40, 120);

      // Top 5 Countries heading
      ctx.fillStyle = "#2c3e50";
      ctx.font = "bold 28px Arial";
      ctx.fillText("Top 5 Countries by Estimated GDP", 40, 180);

      // Top countries list
      let yPosition = 230;
      topCountries.forEach((country, index) => {
        // Bar background
        ctx.fillStyle = "#ecf0f1";
        ctx.fillRect(40, yPosition - 20, 700, 35);

        // Bar fill (gradient-like effect)
        const colors = ["#e74c3c", "#e67e22", "#f39c12", "#3498db", "#2ecc71"];
        ctx.fillStyle = colors[index] || "#95a5a6";
        ctx.fillRect(40, yPosition - 20, 700, 35);

        // Rank
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`${index + 1}.`, 50, yPosition);

        // Country name
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px Arial";
        ctx.fillText(country.name, 90, yPosition);

        // GDP value
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        const gdpFormatted = this.formatGDP(country.estimated_gdp);
        ctx.textAlign = "right";
        ctx.fillText(gdpFormatted, 720, yPosition);

        yPosition += 50;
        ctx.textAlign = "left";
      });

      // Last refreshed timestamp
      ctx.fillStyle = "#7f8c8d";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        `Last Refreshed: ${lastRefreshedAt}`,
        width / 2,
        height - 40
      );

      // Save image
      const buffer = canvas.toBuffer("image/png");
      const cacheDir = path.dirname(outputPath);

      // Create cache directory if it doesn't exist
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Summary image generated at ${outputPath}`);
    } catch (error) {
      console.error("Error generating summary image:", error?.message);
      throw error;
    }
  }

  /**
   * Formats GDP value for display
   * @param {number} gdp - GDP value
   * @returns {string} Formatted GDP string
   */
  static formatGDP(gdp) {
    if (gdp >= 1e12) {
      return `$${(gdp / 1e12).toFixed(2)}T`;
    } else if (gdp >= 1e9) {
      return `$${(gdp / 1e9).toFixed(2)}B`;
    } else if (gdp >= 1e6) {
      return `$${(gdp / 1e6).toFixed(2)}M`;
    } else {
      return `$${gdp.toFixed(2)}`;
    }
  }

  /**
   * Checks if summary image exists
   * @param {string} imagePath - Path to the image
   * @returns {boolean}
   */
  static imageExists(imagePath) {
    return fs.existsSync(imagePath);
  }
}

module.exports = ImageService;
