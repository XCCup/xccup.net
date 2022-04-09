import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Models } from "../../types/Models";

interface TeamAttributes {
  id: string;
  name: string;
  season?: number;
  members?: string[];
}

interface TeamCreationAttributes extends Optional<TeamAttributes, "id"> {}

export interface TeamInstance
  extends Model<TeamAttributes, TeamCreationAttributes>,
    TeamAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initTeam(sequelize: Sequelize): Models["Team"] {
  const Team = sequelize.define<TeamInstance>("Team", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false, // It's allowed that the same name can appear in two different years
    },
    season: {
      type: DataTypes.INTEGER,
    },
    // Create a complete new team entry if the compostion of members changes
    members: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
    },
  });

  // // ??? Don't make this association because a user can change his association in a later season ???
  // Team.associate = (models) => {
  //   Team.hasMany(models.User, {
  //     as: "members",
  //     foreignKey: {
  //       name: "teamId",
  //     },
  //   });
  // };

  return Team;
}
