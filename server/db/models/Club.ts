import { Sequelize, Model, DataTypes, Optional } from "sequelize";

export function initClub(sequelize: Sequelize) {
  const Club = sequelize.define("Club", {
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

  Club.associate = (model) => {
    Club.hasMany(model.User, {
      as: "members",
      foreignKey: {
        name: "clubId",
      },
    });

    Club.hasMany(model.FlyingSite, {
      as: "sites",
      foreignKey: {
        name: "clubId",
      },
    });

    Club.hasOne(model.Logo, {
      as: "logo",
      foreignKey: {
        name: "clubId",
        allowNull: true,
      },
      onDelete: "CASCADE",
      hooks: true,
    });

  // FIXME: Was this missing before?

    Club.hasMany(model.Flight, {
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

// Types

// interface ClubAttributes {
//   id: number;
//   name: string;
//   shortName: string;
//   website: string;
//   urlLogo: string;
//   mapPosition: JSON;
//   participantInSeasons: number[];
//   contacts: JSON;
// }

// interface ClubCreationAttributes extends Optional<ClubAttributes, "id"> {}

// interface ClubInstance
//   extends Model<ClubAttributes, ClubCreationAttributes>,
//     ClubAttributes {
//   createdAt?: Date;
//   updatedAt?: Date;
// }
