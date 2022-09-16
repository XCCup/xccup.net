import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Contact } from "../../types/Contact";
import { Models } from "../../types/Models";

interface ClubAttributes {
  id: string;
  name: string;
  shortName: string;
  website?: string;
  urlLogo?: string;
  mapPosition?: Position;
  participantInSeasons?: number[];
  contacts?: Contact[];
}

interface Position {
  lat: string;
  long: string;
}

interface ClubCreationAttributes extends Optional<ClubAttributes, "id"> {}

export interface ClubInstance
  extends Model<ClubAttributes, ClubCreationAttributes>,
    ClubAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initClub(sequelize: Sequelize): Models["Club"] {
  const Club = sequelize.define<ClubInstance>("Club", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    website: {
      type: DataTypes.STRING,
    },
    urlLogo: {
      type: DataTypes.STRING,
    },
    mapPosition: {
      type: DataTypes.JSON,
    },
    participantInSeasons: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    contacts: {
      type: DataTypes.ARRAY(DataTypes.JSON),
    },
  }) as Models["Club"];

  Club.associate = ({ User, FlyingSite, Logo }) => {
    Club.hasMany(User, {
      as: "members",
      foreignKey: {
        name: "clubId",
      },
    });

    Club.hasMany(FlyingSite, {
      as: "sites",
      foreignKey: {
        name: "clubId",
      },
    });

    Club.hasOne(Logo, {
      as: "logo",
      foreignKey: {
        name: "clubId",
        allowNull: true,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  return Club;
}
