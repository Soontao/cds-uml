import { LinkedEntityDefinition, LinkedModel } from "cds-internal-tool";
import { cp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { getLogger } from "./logger";
import { spawn } from "./utils";

interface PlantUMLAttribute { name: string, type?: string }
interface PlantUMLEntity {
  name: string;
  identifiers: Array<PlantUMLAttribute>;
  mandatoryAttributes: Array<PlantUMLAttribute>;
  attributes: Array<PlantUMLAttribute>;
  // TODO: relations
}
type PlantUMLDiagram = Array<PlantUMLEntity>

export function renderPlantUMLEntity(e: PlantUMLEntity): string {
  return [
    `entity ${e.name} {`,
    ...e.identifiers.map(i => `  *${i.name}: ${i.type}`), // TODO: generated
    "  --",
    ...e.mandatoryAttributes.map(i => `  *${i.name}: ${i.type}`),
    ...e.attributes.map(i => `  ${i.name}: ${i.type}`),
    `}`
  ].join("\n");
}

export function renderPlantUMLDiagram(diagram: PlantUMLDiagram) {
  return [
    "@startuml",
    ...diagram.map(renderPlantUMLEntity),
    "@enduml",
  ].join("\n");
}

/**
 * 
 * @param binaryPath Plant UML jar path
 * @param diagram 
 * @param outputPath expected output file path
 * @param type 
 */
export async function renderPlantUMLToFile(
  binaryPath: string,
  diagram: PlantUMLDiagram,
  outputPath: string,
  type = "png",
  logger = getLogger()
) {
  const diagramContent = renderPlantUMLDiagram(diagram);
  const ts = Date.now();
  const tmpFile = path.join(tmpdir(), `cds_uml_tmp_${ts}.txt`);
  logger.debug("output temp plantuml file", tmpFile);
  const tmpOutputFile = path.join(tmpdir(), `cds_uml_tmp_${ts}.${type}`);
  await writeFile(tmpFile, diagramContent, { encoding: "utf-8" });
  // ref https://plantuml.com/zh/command-line
  await spawn(`java -jar ${binaryPath} ${tmpFile} -t${type}`);
  logger.debug("output temp generated file", tmpOutputFile);
  await cp(tmpOutputFile, outputPath);
}

/**
 * convert cds model to plant uml diagram
 * 
 * @param model 
 * @returns 
 */
export function cdsModelToPlantUMLDiagram(model: LinkedModel, namespace?: string): PlantUMLDiagram {
  return Object.values(model.entities(namespace)).map(cdsEntityToPlantUMLEntity);
}

/**
 * convert cds entity to plant uml entity
 * 
 * @param entity 
 * @returns 
 */
export function cdsEntityToPlantUMLEntity(entity: LinkedEntityDefinition): PlantUMLEntity {
  const plantUMLEntity: PlantUMLEntity = {
    // fix namespace of generated composition
    name: entity.name.endsWith(".texts") ? entity.name.substring(0, entity.name.length - 6) + "_texts" : entity.name,
    identifiers: Object.entries(entity?.keys ?? {}).map(([name, def]) => ({ name, type: def.type })),
    mandatoryAttributes: Object
      .entries(entity?.elements ?? {})
      .filter(([, def]) => def.notNull === true)
      .map(([name, def]) => ({ name, type: def.type })),
    attributes: Object
      .entries(entity?.elements ?? {})
      .filter(([, def]) => def.notNull !== true)
      .map(([name, def]) => ({ name, type: def.type })),
  };
  return plantUMLEntity;
}