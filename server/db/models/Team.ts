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
      unique: false, // It's allowed that the same name can be reused in different seasons
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

  /**
   * Don't create a Team.hasMany(User) association.
   * A team is only valid for one season. After a season the user will loosen his association with this team.
   */

  return Team;
}
