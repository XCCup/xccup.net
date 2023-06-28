import fs, { PathOrFileDescriptor } from "fs";
import jschardet from "jschardet";
import logger from "../config/logger";

export const readIgcFile = (path: PathOrFileDescriptor) => {
  const buffer = fs.readFileSync(path);
  const { encoding: originalEncoding, confidence } = jschardet.detect(buffer);

  logger.debug(
    `IFR: File encoding is ${originalEncoding} by ${confidence * 100}%`
  );

  if (!originalEncoding) {
    throw "Couldn't determine file encoding";
  }

  const encoding: BufferEncoding = Buffer.isEncoding(originalEncoding)
    ? originalEncoding
    : convertEncoding(originalEncoding);

  const content = buffer.toString(encoding);

  return { content, encoding };
};

function convertEncoding(value: string): BufferEncoding {
  switch (value) {
    case "windows-1252":
      return "latin1";

    default:
      throw value + " is no supported encoding format";
  }
}
