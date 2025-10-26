// estimated_gdp = population × random(1000–2000) ÷ exchange_rate
function calculateEstimatedGDP(population, exchangeRate) {
  if (!population || !exchangeRate) {
    return 0;
  }
  const random = Math.floor(Math.random() * 1000) + 1000;
  return (population * random) / exchangeRate;
}

module.exports = { calculateEstimatedGDP };
