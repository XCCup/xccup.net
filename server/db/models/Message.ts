import { Sequelize, Model, DataTypes } from "sequelize";
import { Models } from "../../types/Models";

export const MessageTypes = {
  EMAIL: "email",
  OTHER: "other",
} as const;

export type MessageTypesType = typeof MessageTypes[keyof typeof MessageTypes];

export const EmailMessagePosition = {
  TITLE: "title",
  TEXT: "text",
} as const;

export type EmailMessagePositionType =
  typeof EmailMessagePosition[keyof typeof EmailMessagePosition];

interface MessageAttributes {
  name: string;
  content: string;
  typeOfMessage: MessageTypesType;
  position: EmailMessagePositionType;
}

export interface MessageInstance
  extends Model<MessageAttributes>,
    MessageAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

export function initMessage(sequelize: Sequelize): Models["Message"] {
  const MessageTemplate = sequelize.define<MessageInstance>("Message", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    typeOfMessage: {
      type: DataTypes.STRING(64),
      defaultValue: "other",
    },
    position: {
      type: DataTypes.STRING(64),
    },
  });

  return MessageTemplate;
}
