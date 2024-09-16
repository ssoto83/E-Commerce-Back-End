const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/connection');
const Product = require('./Product');

const Tag = require('./Tag'); // import the Tag model

class ProductTag extends Model {}

ProductTag.init(
  {
    // define columns
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    tag_name: {
      type: DataTypes.STRING,
    },
    Product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Product, // Refers to the Product model
        key: 'id', // Refers to the id field in Product model
      },
    },
    tag_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Tag, // Refers to the Tag model
        key: 'id', // Refers to the id field in Tag model
      },
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'product_tag',
  }
);

module.exports = ProductTag;
