/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-floating-promises */
import cds from "@sap/cds";
import { LinkedModel } from "cds-internal-tool";
import path from "path";
import { cwd } from "process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { download_plantuml } from "./downloader";
import { getLogger } from "./logger";
import { cdsModelToPlantUMLDiagram, renderPlantUMLToFile } from "./plantuml";

yargs(hideBin(process.argv))
  .command(
    "er",
    "create entity relation diagram",
    (yargs) => {
      return yargs
        .option("project", {
          alias: "p",
          describe: "project path",
          default: "."
        })
        .option("output", {
          alias: "o",
          describe: "output path",
          type: "string",
        })
        .option("namespace", {
          alias: "n",
          describe: "namespace",
          type: "string",
        });;
    },
    async function create_entity_relation_diagram(argv) {
      const logger = getLogger();
      const binary_file = await download_plantuml();
      const root = path.join(process.cwd(), argv.project);
      logger.info("project root", root);
      let model: LinkedModel;

      try {
        // @ts-ignore
        model = cds.reflect(cds.compile.for.nodejs(await cds.load("*", { root })));
      } catch (error) {
        logger.error("load model failed");
        logger.error(error.message);
        return;
      }

      const d = cdsModelToPlantUMLDiagram(model, argv.namespace);
      await renderPlantUMLToFile(binary_file, d, path.join(cwd(), argv.output ?? path.basename(root)));
    })
  .demandCommand(1)
  .parse();

