/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { cwdRequireCDS, LinkedModel } from "cds-internal-tool";
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
        })
        .option("type", {
          alias: "t",
          describe: "output file type",
          type: "string",
          default: "png",

        });
    },
    async function create_entity_relation_diagram(argv) {
      const cds = cwdRequireCDS();
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

      const diagram = cdsModelToPlantUMLDiagram(model, argv.namespace);

      await renderPlantUMLToFile(
        binary_file,
        diagram,
        path.join(cwd(), (argv.output ?? path.basename(root)) + `.${argv.type}`),
        argv.type
      );
    })
  .demandCommand(1)
  .parse();

