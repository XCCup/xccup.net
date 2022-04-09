import { Sequelize, Model, DataTypes, Optional, ModelStatic } from "sequelize";

import type { LogoInstance } from "./Logo";

interface Sponsor extends ModelStatic<SponsorInstance> {
  associate: (props: { Logo: ModelStatic<LogoInstance> }) => void;
}

interface SponsorAttributes {
  id: string;
  name: string;
  type: "MANUFACTURER" | "SCHOOL" | "HOLIDAY" | "OTHER";
  website?: string;
  tagline?: string;
  isGoldSponsor: boolean;
  sponsorInSeasons?: number[];
  contacts?: { adress: String; email: String; phone: String; phone2: String };
}

export interface SponsorCreationAttributes
  extends Optional<SponsorAttributes, "id"> {}

export interface SponsorInstance
  extends Model<SponsorAttributes, SponsorCreationAttributes>,
    SponsorAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initSponsor(sequelize: Sequelize) {
  const Sponsor = sequelize.define<SponsorInstance>("Sponsor", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "OTHER", //MANUFACTURER, SCHOOL, HOLIDAY
    },
    website: {
      type: DataTypes.STRING,
    },
    tagline: {
      type: DataTypes.STRING,
    },
    isGoldSponsor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sponsorInSeasons: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    contacts: {
      type: DataTypes.JSON,
    },
  }) as Sponsor;

  Sponsor.associate = ({ Logo }) => {
    Sponsor.hasOne(Logo, {
      as: "logo",
      foreignKey: {
        name: "sponsorId",
        allowNull: true,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Sponsor;
}
