import type * as babel from '@babel/core';
import _templateBuilder from '@babel/template';
import { defaultExportBindings, isAtom } from './utils.js';
import type { PluginOptions } from './utils.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateBuilder = (_templateBuilder as any).default || _templateBuilder;

export default function reactRefreshPlugin(
  { types: t }: typeof babel,
  options?: PluginOptions,
): babel.PluginObj {
  return {
    pre({ opts }) {
      if (!opts.filename) {
        throw new Error('Filename must be available');
      }
    },
    visitor: {
      Program: {
        exit(path) {
          const jotaiAtomCache = templateBuilder(`
          globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
            cache: new Map(),
            get(name, inst) { 
              if (this.cache.has(name)) {
                return this.cache.get(name)
              }
              this.cache.set(name, inst)
              return inst
            },
          }`)();
          path.unshiftContainer('body', jotaiAtomCache);
        },
      },
      ExportDefaultDeclaration(nodePath, state) {
        const { node } = nodePath;
        if (
          t.isCallExpression(node.declaration) &&
          isAtom(t, node.declaration.callee, options?.customAtomNames, nodePath)
        ) {
          const filename = state.filename || 'unknown';
          const atomKey = `${filename}/defaultExport`;

          const buildExport = templateBuilder(
            `export default globalThis.jotaiAtomCache.get(%%atomKey%%, %%atom%%)`,
          );
          const ast = buildExport({
            atomKey: t.stringLiteral(atomKey),
            atom: node.declaration,
          });
          nodePath.replaceWith(ast as babel.Node);
        }
      },
      VariableDeclarator(nodePath, state) {
        if (
          t.isIdentifier(nodePath.node.id) &&
          t.isCallExpression(nodePath.node.init) &&
          isAtom(
            t,
            nodePath.node.init.callee,
            options?.customAtomNames,
            nodePath,
          ) &&
          // Make sure atom declaration is in module scope
          (nodePath.parentPath.parentPath?.isProgram() ||
            nodePath.parentPath.parentPath?.isExportNamedDeclaration())
        ) {
          const filename = state.filename || 'unknown';
          // The binding plugin-debug-label made for `export default atom()`
          // gets the same key as an unchanged default export, so the key
          // doesn't change when that binding has to be renamed.
          const atomName =
            nodePath.node.id.name === defaultExportBindings.get(state.file)
              ? 'defaultExport'
              : nodePath.node.id.name;
          const atomKey = `${filename}/${atomName}`;

          // Only wrap the initializer, so other declarators in the same
          // statement and the declaration kind (let/var) are kept.
          const buildAtomCacheGet = templateBuilder.expression(
            `globalThis.jotaiAtomCache.get(%%atomKey%%, %%atom%%)`,
          );
          const ast = buildAtomCacheGet({
            atomKey: t.stringLiteral(atomKey),
            atom: nodePath.node.init,
          });
          nodePath.get('init').replaceWith(ast as babel.Node);
        }
      },
    },
  };
}
