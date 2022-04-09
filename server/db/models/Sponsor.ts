import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Contact } from "../../types/Contact";
import { Models } from "../../types/Models";

interface SponsorAttributes {
  id: string;
  name: string;
  type: "MANUFACTURER" | "SCHOOL" | "HOLIDAY" | "OTHER";
  website?: string;
  tagline?: string;
  isGoldSponsor: boolean;
  sponsorInSeasons?: number[];
  contacts?: Contact;
}

export interface SponsorCreationAttributes
  extends Optional<SponsorAttributes, "id"> {}

export interface SponsorInstance
  extends Model<SponsorAttributes, SponsorCreationAttributes>,
    SponsorAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initSponsor(sequelize: Sequelize): Models["Sponsor"] {
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
  }) as Models["Sponsor"];

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
