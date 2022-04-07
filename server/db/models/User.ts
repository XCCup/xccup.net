import bcrypt from "bcryptjs";
import logger from "../../config/logger";
import { ROLE } from "../../constants/user-constants";

import { Sequelize, Model, DataTypes, Optional } from "sequelize";

export interface UserAttributes {
  id: string;
  firstName?: string;
  lastName?: string;
  birthday?: Date; // TODO: DB is DATEONLY. Is this correct?
  role?: string;
  gender?: string;
  tshirtSize?: string;
  defaultGlider?: string;
  gliders?: glider[];
  emailInformIfComment?: boolean;
  emailNewsletter?: boolean;
  emailTeamSearch?: boolean;
  address?: object; // TODO: Type this stricter
  email: string;
  rankingNumber?: number;
  password?: string;
  token?: string;
}

interface glider {
  id: string;
  brand: string;
  model: string;
  gliderClass: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initUser(sequelize: Sequelize) {
  const User = sequelize.define<UserInstance>(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      birthday: {
        type: DataTypes.DATEONLY,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: ROLE.INACTIVE,
      },
      gender: {
        type: DataTypes.STRING,
      },
      tshirtSize: {
        type: DataTypes.STRING,
      },
      defaultGlider: {
        type: DataTypes.UUID,
      },
      gliders: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        /*
        glider: {
          id: UUID
          brand: String,
          model: String
          gliderClass: String
        }
        */
        defaultValue: [],
      },
      emailInformIfComment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      emailNewsletter: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      emailTeamSearch: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      address: {
        type: DataTypes.JSON,
        // Needed to send prices (e.g. T-Shirt) to an user.
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Constrain on DB
        validate: {
          // Validation will be performed before any sql interaction happens
          notEmpty: true, // No empty string allowed
        },
      },
      rankingNumber: {
        type: DataTypes.INTEGER,
        unique: true,
        // The number should represent the position the user reached in last years overall ranking
      },
      password: {
        type: DataTypes.STRING,
      },
      token: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {
        beforeSave: (user) => {
          const BCRYPT_ALGO_IDENTIFIER = "$2a$10$";

          const salt = bcrypt.genSaltSync();
          // Prevention to hash a password again if it was saved again
          if (
            user.password &&
            !user.password.startsWith(BCRYPT_ALGO_IDENTIFIER)
          ) {
            user.password = bcrypt.hashSync(user.password, salt);
            logger.info("U: Password of user " + user.id + " will be hashed");
          }
        },
      },
    }
  );

  // Define instance level methods for user
  User.prototype.validPassword = function (password: string) {
    return (
      bcrypt.compareSync(password, this.password) && this.role != ROLE.INACTIVE
    );
  };
  User.prototype.getAge = function () {
    if (!this.birthday) return 0;

    const birthYear = new Date(Date.parse(this.birthday)).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  User.associate = ({
    Flight,
    FlightComment,
    ProfilePicture,
    FlightPhoto,
    Club,
    Team,
  }) => {
    User.hasMany(Flight, {
      as: "flights",
      foreignKey: {
        name: "userId",
      },
    });
    User.hasMany(FlightComment, {
      as: "comments",
      foreignKey: {
        name: "userId",
        //Through this constrain it's realized that every comment, will be delete if the user will be deleted
        allowNull: false,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
    User.hasOne(ProfilePicture, {
      as: "picture",
      foreignKey: {
        name: "userId",
        //Through this constrain it's realized that every comment, will be delete if the user will be deleted
        allowNull: false,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
    User.hasMany(FlightPhoto, {
      as: "photos",
      foreignKey: {
        name: "userId",
        //Through this constrain it's realized that every comment, will be delete if the user will be deleted
        allowNull: false,
      },
      onDelete: "CASCADE",
      hooks: true,
    });
    User.belongsTo(Club, {
      as: "club",
      foreignKey: {
        name: "clubId",
      },
    });
    User.belongsTo(Team, {
      as: "team",
      foreignKey: {
        name: "teamId",
      },
    });
  };
  return User;
}
