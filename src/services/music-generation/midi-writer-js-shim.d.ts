// midi-writer-js@3.2.1 ships valid .d.ts files (build/types/main.d.ts) but its package.json
// "exports" map has no "types" condition, so TypeScript's NodeNext resolution can't find them
// even though `types` is set at the package.json root. This re-exports the real types so the
// rest of the codebase gets full typing without patching node_modules.
declare module "midi-writer-js" {
    export * from "midi-writer-js/build/types/main";
    import main from "midi-writer-js/build/types/main";
    export default main;
}
