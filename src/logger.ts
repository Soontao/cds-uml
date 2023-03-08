// @ts-nocheck
import { cwdRequireCDS, Logger } from "cds-internal-tool";

export function getLogger(): Logger {
  if (getLogger.logger === undefined) {
    getLogger.logger = cwdRequireCDS().log("cds-uml");
  }
  return getLogger.logger as Logger;
}
