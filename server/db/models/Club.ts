import { Sequelize, Model, DataTypes, Optional } from "sequelize";

interface ClubAttributes {
  id: string;
  name: string;
  shortName: string;
  website?: string;
  urlLogo?: string;
  mapPosition: object; //TODO: type this stricter
  participantInSeasons: number[];
  contacts: object[]; //TODO: type this stricter
}

interface ClubCreationAttributes extends Optional<ClubAttributes, "id"> {}

interface ClubInstance
  extends Model<ClubAttributes, ClubCreationAttributes>,
    ClubAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initClub(sequelize: Sequelize) {
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
  });

  Club.associate = ({ User, FlyingSite, Logo, Flight }) => {
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

    // FIXME: Was this missing before?

    Club.hasMany(Flight, {
      as: "flights",
      foreignKey: {
        name: "flightId",
        allowNull: true,
      },
      hooks: true,
    });
  };

  return Club;
}
