const db = require("../models");
const ExchangeRateService = require("../services/exchangeRateService");
const RestCountriesService = require("../services/restCountriesService");
const ImageService = require("../services/imageService");
const { calculateEstimatedGDP } = require("../utils");
const path = require("path");

const Country = db.country;
const RefreshMetadata = db.refreshMetadata;

class CountryController {
  static async getCountries(req, res) {
    try {
      const { region, currency, sort } = req.query;

      // Build where clause for filters
      const whereClause = {};
      if (region) {
        whereClause.region = region;
      }
      if (currency) {
        whereClause.currency_code = currency;
      }

      // Build order clause for sorting
      let orderClause = [];
      if (sort) {
        const [field, direction] = sort.split("_");
        if (field === "gdp") {
          orderClause = [
            ["estimated_gdp", direction === "desc" ? "DESC" : "ASC"],
          ];
        } else if (field === "name") {
          orderClause = [["name", direction === "desc" ? "DESC" : "ASC"]];
        } else if (field === "population") {
          orderClause = [["population", direction === "desc" ? "DESC" : "ASC"]];
        }
      }

      // If no sort specified, default to name ascending
      if (orderClause.length === 0) {
        orderClause = [["name", "ASC"]];
      }

      const countries = await Country.findAll({
        where: whereClause,
        order: orderClause,
      });

      res.status(200).json(countries);
    } catch (error) {
      console.error("Error in getCountries:", error?.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getCountryByName(req, res) {
    try {
      const { name } = req.params;

      const country = await Country.findOne({
        where: db.Sequelize.where(
          db.Sequelize.fn("LOWER", db.Sequelize.col("name")),
          "=",
          db.Sequelize.fn("LOWER", name)
        ),
      });

      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      res.status(200).json(country);
    } catch (error) {
      console.error("Error in getCountryByName:", error?.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async deleteCountryByName(req, res) {
    try {
      const { name } = req.params;

      const country = await Country.findOne({
        where: db.Sequelize.where(
          db.Sequelize.fn("LOWER", db.Sequelize.col("name")),
          "=",
          db.Sequelize.fn("LOWER", name)
        ),
      });

      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      await country.destroy();

      res.status(200).json({
        message: "Country deleted successfully",
        country: {
          name: country.name,
        },
      });
    } catch (error) {
      console.error("Error in deleteCountryByName:", error?.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getStatus(req, res) {
    try {
      const totalCountries = await Country.count();

      const metadata = await RefreshMetadata.findByPk(1);
      const lastRefreshedAt = metadata
        ? metadata.last_refreshed_at.toISOString()
        : null;

      res.status(200).json({
        total_countries: totalCountries,
        last_refreshed_at: lastRefreshedAt,
      });
    } catch (error) {
      console.error("Error in getStatus:", error?.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getSummaryImage(req, res) {
    try {
      const imagePath = path.join(__dirname, "..", "cache", "summary.png");

      if (!ImageService.imageExists(imagePath)) {
        return res.status(404).json({ error: "Summary image not found" });
      }

      res.sendFile(imagePath);
    } catch (error) {
      console.error("Error serving summary image:", error?.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async refreshCountries(req, res) {
    try {
      let countriesData, exchangeRateData;

      try {
        [countriesData, exchangeRateData] = await Promise.all([
          RestCountriesService.getCountries(),
          ExchangeRateService.getExchangeRate(),
        ]);
      } catch (apiError) {
        const apiName = apiError.message;
        return res.status(503).json({
          error: "External data source unavailable",
          details: `Could not fetch data from ${apiName}`,
        });
      }

      if (!countriesData || countriesData.length === 0) {
        return res.status(503).json({
          error: "External data source unavailable",
          details: "Could not fetch data from REST Countries API",
        });
      }

      if (!exchangeRateData || !exchangeRateData.rates) {
        return res.status(503).json({
          error: "External data source unavailable",
          details: "Could not fetch data from Exchange Rate API",
        });
      }

      const timestamp = new Date().toISOString();

      const countriesWithEstimatedGDP = countriesData
        .map((country) => {
          const currencyCode = country?.currencies?.[0]?.code || null;
          const exchangeRate = exchangeRateData.rates[currencyCode] || null;

          const estimatedGDP =
            currencyCode && exchangeRate === null
              ? null
              : calculateEstimatedGDP(country?.population, exchangeRate);

          return {
            name: country?.name,
            capital: country?.capital,
            region: country?.region,
            population: country?.population,
            currency_code: currencyCode,
            exchange_rate: exchangeRate,
            estimated_gdp: estimatedGDP,
            flag_url: country?.flag,
            last_refreshed_at: timestamp,
          };
        })
        .filter(
          (country) =>
            country?.currency_code !== null && country?.exchange_rate !== null
        );

      // Process each country for upsert
      const upsertPromises = countriesWithEstimatedGDP.map(
        async (countryData) => {
          const [country, created] = await Country.findOrCreate({
            where: db.Sequelize.where(
              db.Sequelize.fn("LOWER", db.Sequelize.col("name")),
              "=",
              db.Sequelize.fn("LOWER", countryData.name)
            ),
            defaults: countryData,
          });

          // If country exists (not created), update all fields
          if (!created) {
            await country.update(countryData);
          }

          return { country, created };
        }
      );

      const results = await Promise.all(upsertPromises);
      const countries = results.map((result) => result.country);
      const createdCount = results.filter((result) => result.created).length;
      const updatedCount = results.filter((result) => !result.created).length;

      // Update global last_refreshed_at timestamp
      await RefreshMetadata.findOrCreate({
        where: { id: 1 },
        defaults: { last_refreshed_at: timestamp },
      }).then(async ([metadata, created]) => {
        if (!created) {
          await metadata.update({ last_refreshed_at: timestamp });
        }
      });

      // Generate summary image
      try {
        const topCountries = await Country.findAll({
          attributes: ["name", "estimated_gdp"],
          order: [["estimated_gdp", "DESC"]],
          limit: 5,
        });

        const imagePath = path.join(__dirname, "..", "cache", "summary.png");
        await ImageService.generateSummaryImage({
          totalCountries: countries.length,
          topCountries: topCountries.map((c) => ({
            name: c?.name,
            estimated_gdp: c?.estimated_gdp,
          })),
          lastRefreshedAt: timestamp,
          outputPath: imagePath,
        });
      } catch (imageError) {
        console.error("Error generating summary image:", imageError?.message);
        // Don't fail the entire request if image generation fails
      }

      res.status(201).json({
        message: "Countries refreshed successfully",
        countries,
        summary: {
          last_refreshed_at: timestamp,
          total: countries.length,
          created: createdCount,
          updated: updatedCount,
        },
      });
    } catch (error) {
      console.error("Error in refreshCountries:", error?.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = CountryController;
