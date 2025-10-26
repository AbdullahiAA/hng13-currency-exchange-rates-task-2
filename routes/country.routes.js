const express = require("express");
const router = express.Router();
const CountryController = require("../controllers/country.controller");

router.get("/", CountryController.getCountries);

router.get("/image", CountryController.getSummaryImage);

router.get("/:name", CountryController.getCountryByName);

router.delete("/:name", CountryController.deleteCountryByName);

router.post("/refresh", CountryController.refreshCountries);

module.exports = router;
