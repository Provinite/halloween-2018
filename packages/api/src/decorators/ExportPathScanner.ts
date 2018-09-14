import * as glob from "glob";
import { Constructor } from "./Constructor";
import { decoratedType, DecoratedTypes, isScannable } from "./Symbols";
export class ExportPathScanner {
  static async scan(pathGlob: string) {
    const files: string[] = await new Promise<string[]>((resolve, reject) => {
      glob(pathGlob, { absolute: true }, function(err, globbedFiles: string[]) {
        resolve(
          globbedFiles.filter(
            v => !v.includes("node_modules") && !v.endsWith("app.js")
          )
        );
      });
    });
    const components: Constructor[] = [];
    for (const file of files) {
      require(file);
    }
    const modules = require.cache;
    for (const moduleId of Object.keys(modules)) {
      const theModule = modules[moduleId];
      const isOurModule: boolean = !moduleId.includes("node_modules");
      if (theModule.exports && isOurModule) {
        const exportedNames = Object.keys(theModule.exports);
        for (const exportName of exportedNames) {
          const theExport = theModule.exports[exportName];
          if (
            theExport[isScannable] &&
            theExport[decoratedType] === DecoratedTypes.CLASS
          ) {
            console.log(
              "Module Path Scanning Revealed scannable class:" + moduleId
            );
            components.push(theExport);
          }
        }
      }
    }
    return components;
  }
}
