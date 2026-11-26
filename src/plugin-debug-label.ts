import type * as babel from '@babel/core';
import _templateBuilder from '@babel/template';
import { defaultExportBindings, isAtom } from './utils.js';
import type { PluginOptions } from './utils.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateBuilder = (_templateBuilder as any).default || _templateBuilder;

// Binding name -> debugLabel for atoms made from `export default atom()`
const debugLabelsKey = 'jotaiDefaultExportDebugLabels';

// The CommonJS module wrapper's parameters. Babel's CommonJS transform
// renames user bindings with these names, but not the binding made here,
// so `const module = atom(0)` would clash with the wrapper.
const moduleWrapperNames = new Set([
  'exports',
  'require',
  'module',
  '__filename',
  '__dirname',
]);

export default function debugLabelPlugin(
  { types: t }: typeof babel,
  options?: PluginOptions,
): babel.PluginObj {
  return {
    visitor: {
      ExportDefaultDeclaration(nodePath, state) {
        const { node } = nodePath;
        if (
          t.isCallExpression(node.declaration) &&
          isAtom(t, node.declaration.callee, options?.customAtomNames, nodePath)
        ) {
          const filename = (state.filename || 'unknown').replace(/\.\w+$/, '');

          // Windows paths use backslashes
          let displayName = filename.split(/[\\/]/).pop()!;

          // ./{module name}/index.js
          if (displayName === 'index') {
            displayName =
              filename.slice(0, -'/index'.length).split(/[\\/]/).pop() ||
              'unknown';
          }
          // The file name may not be a valid or free binding name
          // (`user-atoms.js`, `class.js`, `atom.js`, `console.js`).
          const { scope } = nodePath;
          let atomIdentifier = t.identifier(t.toIdentifier(displayName));
          if (
            moduleWrapperNames.has(atomIdentifier.name) ||
            scope.hasBinding(atomIdentifier.name) ||
            scope.hasGlobal(atomIdentifier.name) ||
            scope.hasReference(atomIdentifier.name)
          ) {
            atomIdentifier = scope.generateUidIdentifier(atomIdentifier.name);
          }
          // A Map, so names like `constructor` don't read Object.prototype
          let debugLabels: Map<string, string> | undefined =
            state.get(debugLabelsKey);
          if (!debugLabels) {
            debugLabels = new Map();
            state.set(debugLabelsKey, debugLabels);
          }
          debugLabels.set(atomIdentifier.name, displayName);
          defaultExportBindings.set(state.file, atomIdentifier.name);
          // Relies on visiting the variable declaration to add the debugLabel
          const buildExport = templateBuilder(`
          const %%atomIdentifier%% = %%atom%%;
          export default %%atomIdentifier%%
          `);
          const ast = buildExport({
            atomIdentifier,
            atom: node.declaration,
          });
          nodePath.replaceWithMultiple(ast as babel.Node[]);
        }
      },
      VariableDeclarator(path, state) {
        if (
          t.isIdentifier(path.node.id) &&
          t.isCallExpression(path.node.init) &&
          isAtom(t, path.node.init.callee, options?.customAtomNames, path)
        ) {
          const debugLabels: Map<string, string> | undefined =
            state.get(debugLabelsKey);
          path.parentPath.insertAfter(
            t.expressionStatement(
              t.assignmentExpression(
                '=',
                t.memberExpression(
                  t.identifier(path.node.id.name),
                  t.identifier('debugLabel'),
                ),
                t.stringLiteral(
                  (path.scope.block.type === 'Program' &&
                    debugLabels?.get(path.node.id.name)) ||
                    path.node.id.name,
                ),
              ),
            ),
          );
        }
      },
    },
  };
}
