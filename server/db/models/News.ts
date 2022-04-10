import { Sequelize, Model, DataTypes, Optional } from "sequelize";
import { Models } from "../../types/Models";

export interface NewsAttributes {
  id: string;
  title: string;
  message: string;
  icon: string;
  from?: string;
  till?: string;
  meta?: Meta;
}

interface Meta {
  links?: [
    {
      title?: string;
      value?: string;
      internal?: boolean;
    }
  ];
}

export interface NewsCreationAttributes
  extends Optional<NewsAttributes, "id"> {}

export interface NewsInstance
  extends Model<NewsAttributes, NewsCreationAttributes>,
    NewsAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initNews(sequelize: Sequelize): Models["News"] {
  const News = sequelize.define<NewsInstance>("News", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(5000),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    till: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    meta: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  });

  return News;
}
