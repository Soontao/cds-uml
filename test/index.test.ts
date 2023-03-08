import { cwdRequireCDS } from "cds-internal-tool";
import { readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { download_plantuml } from "../src/downloader";
import { cdsModelToPlantUMLDiagram, renderPlantUMLToFile } from "../src/plantuml";

describe("Index Test Suite", () => {

  it('should support generate something firstly', async () => {
    const cds = cwdRequireCDS()
    const binary_path = await download_plantuml()
    expect(binary_path).not.toBeUndefined()
    const m1 = cds.reflect(cds.compile.for.nodejs(await cds.load(path.join(__dirname, "./resources/simple.cds"))));
    const diagram = cdsModelToPlantUMLDiagram(m1)
    expect(diagram).toMatchSnapshot()
    const test_file = path.join(tmpdir(), `cds_uml_test_${Date.now()}.svg`)
    await renderPlantUMLToFile(binary_path, diagram, test_file, "svg")
    expect(await readFile(test_file, { encoding: "utf-8" })).toMatchSnapshot()
  });


});
