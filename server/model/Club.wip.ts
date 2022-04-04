import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "../config/postgres";

interface ClubInstance extends Model {
  id: number;
  name: string;
  shortName: string;
  website: string;
  urlLogo: string;
  mapPosition: JSON;
  participantInSeasons: number[];
  contacts: JSON;
}

const ClubModel = sequelize.define<ClubInstance>("Club", {
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

ClubModel.associate = (models) => {
  ClubModel.hasMany(models.User, {
    as: "members",
    foreignKey: {
      name: "clubId",
    },
  });
};

Club.associate = (models) => {
  Club.hasMany(models.FlyingSite, {
    as: "sites",
    foreignKey: {
      name: "clubId",
    },
  });
};

Club.associate = (models) => {
  Club.hasOne(models.Logo, {
    as: "logo",
    foreignKey: {
      name: "clubId",
      allowNull: true,
    },
    onDelete: "CASCADE",
    hooks: true,
  });
};

module.exports = (sequelize, DataTypes) => {
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

  Club.associate = (models) => {
    Club.hasMany(models.User, {
      as: "members",
      foreignKey: {
        name: "clubId",
      },
    });
  };

  Club.associate = (models) => {
    Club.hasMany(models.FlyingSite, {
      as: "sites",
      foreignKey: {
        name: "clubId",
      },
    });
  };

  Club.associate = (models) => {
    Club.hasOne(models.Logo, {
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
};
