module.exports = (sequelize, DataTypes) => {
  const RefreshMetadata = sequelize.define("refreshMetadata", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    last_refreshed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
  return RefreshMetadata;
};
