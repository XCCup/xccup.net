import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Models } from "../../types/Models";

export interface SeasonDetailAttributes {
  id: number;
  year: number;
  startDate: Date;
  endDate: Date;
  isPaused: boolean;
  pointThresholdForFlight: number;
  numberOfFlightsForShirt: number;
  gliderClasses: GliderClasses;
  flightTypeFactors: FlightTypeFactors;
  rankingClasses: RankingClasses;
  seniorStartAge: number;
  seniorBonusPerAge: number;
  activeRankings: RankingTypes[];
  misc?: {
    textMessages?: {
      [key: string]: string;
    };
  };
}

type GliderClass =
  | "AB_low"
  | "AB_high"
  | "C_low"
  | "C_high"
  | "D_low"
  | "D_high"
  | "Tandem"
  | "HG_1_Turm"
  | "HG_1_Turmlos"
  | "HG_5_starr";

export type GliderClasses = {
  [key in GliderClass]: {
    scoringMultiplicator: {
      BASE: number;
      FREE: number;
      FLAT: number;
      FAI: number;
    };
    description: string;
    shortDescription: string;
  };
};

export interface RankingClasses {
  [key: string]: {
    gliderClasses: string[];
    description: string;
    shortDescription: string;
  };
}

export interface FlightTypeFactors {
  FAI: number;
  FLAT: number;
  FREE: number;
}

export type RankingTypes =
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
      unique: true,
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
