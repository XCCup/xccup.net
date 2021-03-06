import { Sequelize, Model, DataTypes } from "sequelize";
import { Models } from "../../types/Models";

interface SeasonDetailAttributes {
  year: number;
  startDate: Date;
  endDate: Date;
  isPaused: boolean;
  pointThresholdForFlight: number;
  numberOfFlightsForShirt: number;
  gliderClasses: object; // TODO: Type this stricter
  flightTypeFactors: object; // TODO: Type this stricter
  rankingClasses: object; // TODO: Type this stricter
  seniorStartAge: number;
  seniorBonusPerAge: number;
  activeRankings: RankingTypes[];
  misc?: object; // TODO: Type this stricter
}

type RankingTypes =
  | "overall"
  | "ladies"
  | "club"
  | "team"
  | "seniors"
  | "newcomer"
  | "fun"
  | "sundays"
  | "RP"
  | "LUX"
  | "earlyBird"
  | "lateBird";

export interface SeasonDetailInstance
  extends Model<SeasonDetailAttributes>,
    SeasonDetailAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initSeasonDetail(sequelize: Sequelize): Models["SeasonDetail"] {
  const SeasonDetail = sequelize.define<SeasonDetailInstance>("SeasonDetail", {
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isPaused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pointThresholdForFlight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numberOfFlightsForShirt: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gliderClasses: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    flightTypeFactors: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    rankingClasses: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    seniorStartAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seniorBonusPerAge: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activeRankings: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: ["overall", "ladies", "club", "team"],
    },
    misc: {
      type: DataTypes.JSON,
    },
  });
  return SeasonDetail;
}
