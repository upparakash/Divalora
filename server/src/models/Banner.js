import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

// Matches the three Hero placements in the storefront today. Add to this
// list (and the matching frontend PLACEMENTS in src/lib/banners.js) if a
// new page ever needs its own managed hero.
export const PLACEMENTS = ["home", "handbags", "about"];
export const MEDIA_TYPES = ["image", "video"];

// Mirrors the Hero component's tone prop — controls whether overlay text
// renders light-on-dark or dark-on-light.
export const TONES = ["charcoal", "cream", "gold", "ink", "line"];

export const Banner = sequelize.define(
  "Banner",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    placement: {
      type: DataTypes.ENUM(...PLACEMENTS),
      allowNull: false,
    },
    mediaType: {
      type: DataTypes.ENUM(...MEDIA_TYPES),
      allowNull: false,
      defaultValue: "image",
      field: "media_type",
    },
    mediaFilename: {
      type: DataTypes.STRING(160),
      field: "media_filename",
    },
    posterFilename: {
      type: DataTypes.STRING(160),
      field: "poster_filename",
    },
    eyebrow: {
      type: DataTypes.STRING(120),
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING(320),
    },
    ctaLabel: {
      type: DataTypes.STRING(80),
      field: "cta_label",
    },
    ctaTo: {
      type: DataTypes.STRING(200),
      field: "cta_to",
    },
    tone: {
      type: DataTypes.ENUM(...TONES),
      allowNull: false,
      defaultValue: "charcoal",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order",
    },
  },
  {
    tableName: "Divalora_banners",
    underscored: true,
  }
);
