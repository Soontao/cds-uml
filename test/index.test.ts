import { cwdRequireCDS } from "cds-internal-tool";
import path from "path";
import { cdsModelToPlantUMLDiagram } from "../src/plantuml";

describe("Index Test Suite", () => {

  it('should support generate something firstly', async () => {
    const cds = cwdRequireCDS()
    const m1 = cds.reflect(cds.compile.for.nodejs(await cds.load(path.join(__dirname, "./resources/simple.cds"))));
    expect(cdsModelToPlantUMLDiagram(m1)).toMatchSnapshot()
  });


});
