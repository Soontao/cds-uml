import axios from "axios";
import { createWriteStream, existsSync } from "fs";
import { } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { getLogger } from "./logger";

const BASE_URL = "https://github.com/plantuml/plantuml/releases/download";

export async function download_plantuml(version = "1.2023.2") {
  const logger = getLogger();
  logger.debug("download plantuml binary, version", version);

  const target_file = path.join(tmpdir(), `plantuml_${version.replaceAll(/\./g, "_")}.jar`);
  logger.debug("binary storage location", target_file);

  if (existsSync(target_file)) {
    logger.debug("plantuml already existed, do nothing");
    return target_file;
  }

  logger.info("downloading plantuml...");
  const download_link = `${BASE_URL}/v${version}/plantuml-${version}.jar`;
  const response = await axios.get(download_link, { responseType: "stream" });

  return new Promise<string>((resolve, reject) => {
    if (response.status >= 400) {
      logger.error("download binary failed", response.status, response.statusText, response.data);
      reject(response.statusText);
    }
    response.data.pipe(createWriteStream(target_file));
    response.data.on("finish", () => {
      logger.info("plantuml binary downloaded");
      return resolve(target_file);
    });
  });
}
