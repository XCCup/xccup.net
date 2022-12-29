import logger from "../config/logger";
import { cache } from "../controller/CacheManager";
import db from "../db";
import {
  EmailMessagePosition,
  EmailMessagePositionType,
  MessageTypes,
  MessageTypesType,
} from "../db/models/Message";

const PLACEHOLDER_PREFIX = "$";
const CACHE_PREFIX = "msg_template_";

interface PlaceholderReplacements {
  [name: string]: string | undefined;
}

interface EmailMessage {
  title: string;
  text: string;
}

export async function getMessageByNameForEmail(
  name: string,
  placeholderReplacementsText?: PlaceholderReplacements,
  placeholderReplacementsTitle?: PlaceholderReplacements
) {
  const CACHE_KEY = CACHE_PREFIX + name;

  let message = cache.get(CACHE_KEY) as EmailMessage | null;

  if (!message) {
    try {
      message = await retrieveEmailParts(name);
    } catch (error) {
      logger.error("MS: " + error);
      return;
    }

    cache.set(CACHE_KEY, message, 0);
  }

  console.log("JSON: ", JSON.stringify(message, null, 2));

  try {
    message.text = replacePlaceholder(
      message.text,
      placeholderReplacementsText
    );
    message.title = replacePlaceholder(
      message.title,
      placeholderReplacementsTitle
    );
  } catch (error) {
    logger.error("MS: " + error);
    return;
  }

  return message;
}

async function retrieveEmailParts(name: string) {
  const [title, text] = await Promise.all([
    retrieveMessageFromDb(name, MessageTypes.EMAIL, EmailMessagePosition.TITLE),
    retrieveMessageFromDb(name, MessageTypes.EMAIL, EmailMessagePosition.TEXT),
  ]);

  if (!title) {
    throw `No title for message with name ${name} found`;
  }

  if (!text) {
    throw `No text for message with name ${name} found`;
  }

  return { title, text };
}

async function retrieveMessageFromDb(
  name: string,
  typeOfMessage?: MessageTypesType,
  position?: EmailMessagePositionType
) {
  const dbEntry = await db.Message.findOne({
    where: { name, typeOfMessage, position },
    raw: true,
    attributes: ["content"],
  });

  return dbEntry?.content;
}

/**
 * Replaces the placeholder in the message template with a specified value.
 * The name of the placeholder has to match the name of the property in the parameters object.
 */
function replacePlaceholder(
  messageWithPlaceholders: string,
  placeholderReplacements?: PlaceholderReplacements
) {
  if (!placeholderReplacements) {
    logger.debug("MS: No replacements specified");
    return messageWithPlaceholders;
  }

  for (const [key, value] of Object.entries(placeholderReplacements)) {
    if (!value) throw `Value of ${key} is undefined`;
    console.log("K: " + key);
    console.log("V: " + value);
    messageWithPlaceholders = messageWithPlaceholders.replaceAll(
      PLACEHOLDER_PREFIX + key,
      value
    );
    console.log("MWP: " + messageWithPlaceholders);
  }
  return messageWithPlaceholders;
}
