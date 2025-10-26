module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define("country", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capital: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    population: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exchange_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    estimated_gdp: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    flag_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_refreshed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
  return Country;
};
