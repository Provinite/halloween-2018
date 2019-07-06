import * as glob from "glob";
import { classIsScannable, IScannableClass } from "./ScannableClass";
import { decoratedType, DecoratedTypes } from "./Symbols";
export class ExportPathScanner {
  static async scan(pathGlob: string): Promise<IScannableClass[]> {
    const files: string[] = await new Promise<string[]>((resolve, reject) => {
      glob(pathGlob, { absolute: true }, function(err, globbedFiles: string[]) {
        resolve(
          globbedFiles.filter(
            // Naively disregard node_modules, also ignore our app.js
            // tbh this is pretty opinionated here.
            // maybe make this configurable?
            v => !v.includes("node_modules") && !v.endsWith("app.js")
          )
        );
      });
    });
    // final result
    const components: IScannableClass[] = [];
    const modules: any = [];
    // require in all the files we found
    for (const file of files) {
      modules.push(require(file));
    }
    for (const _module of modules) {
      // Same sloppiness as above
      const exportedNames = Object.keys(_module);
      // Run down the exports provided by the module
      for (const exportName of exportedNames) {
        const theExport = _module[exportName];
        // Grab all of our decorated classes
        if (
          classIsScannable(theExport) &&
          theExport[decoratedType] === DecoratedTypes.CLASS
        ) {
          components.push(theExport);
        }
      }
    }
    return components;
  }
}
