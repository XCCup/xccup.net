import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Models } from "../../types/Models";

interface SeasonDetailAttributes {
  id: number;
  year: number;
  startDate: Date;
  endDate: Date;
  isPaused: boolean;
  pointThresholdForFlight: number;
  numberOfFlightsForShirt: number;
  gliderClasses: object; // TODO: Type this stricter
  flightTypeFactors: FlightTypeFactors;
  rankingClasses: object; // TODO: Type this stricter
  seniorStartAge: number;
  seniorBonusPerAge: number;
  activeRankings: RankingTypes[];
  misc?: object; // TODO: Type this stricter
}

export interface FlightTypeFactors {
  FAI: number;
  FLAT: number;
  FREE: number;
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

export interface SeasonDetailCreationAttributes
  extends Optional<SeasonDetailAttributes, "id"> {}

export interface SeasonDetailInstance
  extends Model<SeasonDetailAttributes, SeasonDetailCreationAttributes>,
    SeasonDetailAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initSeasonDetail(sequelize: Sequelize): Models["SeasonDetail"] {
  const SeasonDetail = sequelize.define<SeasonDetailInstance>("SeasonDetail", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
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
