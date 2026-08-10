import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

export const CATEGORIES = [
  "Tote",
  "Shoulder Bag",
  "Top Handle",
  "Crossbody",
  "Mini Bag",
  "Clutch",
  "Travel",
];

export const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    styleCode: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      field: "style_code",
    },
    slug: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...CATEGORIES),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
    },
    colorway: {
      type: DataTypes.STRING(80),
    },
    material: {
      type: DataTypes.STRING(160),
    },
    dimensions: {
      type: DataTypes.STRING(160),
    },
    description: {
      type: DataTypes.TEXT,
    },
    details: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_featured",
    },
    isNew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_new",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order",
    },
  },
  {
    tableName: "Divalora_products",
    underscored: true,
  }
);
