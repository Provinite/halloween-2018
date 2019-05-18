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
    const importPromises: { [moduleIdentifier: string]: Promise<any> } = {};
    const modules: { [moduleIdentifier: string]: any } = {};

    // require in all the files we found
    for (const file of files) {
      importPromises[file] = import(file);
    }
    for (const file of files) {
      modules[file] = await importPromises[file];
    }

    // run down all loaded modules
    // potential pitfall: we're not validating the modules we're scanning are
    // actually from the provided path. Anyone else's routable methods
    // and such would run over our stuff.
    //const modules = require.cache;

    // This is sloppy. Isn't there an Object.entries or something specifically
    // for this use case?
    for (const moduleId of Object.keys(modules)) {
      const theModule = modules[moduleId];
      // Naively disregard node_modules, this should be extracted out to a helper
      // ourModule is probably a minsomer. It's just not a node_module.
      // also what happens if you want to use this on (from within) a delivered
      // dependency or just in /foo/foo-node_modules-bar/my-app
      const isOurModule: boolean = !moduleId.includes("node_modules");

      if (theModule && isOurModule) {
        // Same sloppiness as above
        const exportedNames = Object.keys(theModule);
        // Run down the exports provided by the module
        for (const exportName of exportedNames) {
          const theExport = theModule[exportName];
          // Grab all of our decorated classes
          // JS gives us a ton of flexibility here. Is it possible to decorate
          // an exported variable?
          const isScannable = classIsScannable(theExport);
          const isClass = theExport[decoratedType] === DecoratedTypes.CLASS;
          if (isScannable && isClass) {
            components.push(theExport);
          }
        }
      }
    }
    return components;
  }
}
