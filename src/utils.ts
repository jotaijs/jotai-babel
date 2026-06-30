import { types } from '@babel/core';

export interface PluginOptions {
  customAtomNames?: string[];
}

function isJotaiSource(source: string): boolean {
  return (
    source === 'jotai' ||
    source.startsWith('jotai/') ||
    source.startsWith('jotai-')
  );
}

export function getJotaiImportedNames(
  t: typeof types,
  programNode: babel.types.Program,
): {
  importedNames: Set<string>;
  importedNamespaces: Set<string>;
} {
  const importedNames = new Set<string>();
  const importedNamespaces = new Set<string>();

  for (const node of programNode.body) {
    if (!t.isImportDeclaration(node)) continue;
    if (!isJotaiSource(node.source.value)) continue;

    for (const specifier of node.specifiers) {
      if (t.isImportSpecifier(specifier)) {
        importedNames.add(specifier.local.name);
      } else if (
        t.isImportDefaultSpecifier(specifier) ||
        t.isImportNamespaceSpecifier(specifier)
      ) {
        importedNamespaces.add(specifier.local.name);
      }
    }
  }

  return { importedNames, importedNamespaces };
}

export function isAtom(
  t: typeof types,
  callee: babel.types.Expression | babel.types.V8IntrinsicIdentifier,
  customAtomNames: PluginOptions['customAtomNames'] = [],
  importedNames?: Set<string>,
  importedNamespaces?: Set<string>,
): boolean {
  const atomNames = [...atomFunctionNames, ...customAtomNames];

  if (t.isIdentifier(callee) && atomNames.includes(callee.name)) {
    // Custom atom names always pass (user has explicitly opted in)
    if (customAtomNames.includes(callee.name)) return true;
    // If we have import information, verify it was imported from jotai
    if (importedNames) {
      return importedNames.has(callee.name);
    }
    return true;
  }

  if (t.isMemberExpression(callee)) {
    const { object, property } = callee;
    if (t.isIdentifier(property) && atomNames.includes(property.name)) {
      // For member expressions (e.g. jotai.atom()), check the namespace
      if (importedNamespaces) {
        return t.isIdentifier(object) && importedNamespaces.has(object.name);
      }
      return true;
    }
  }

  return false;
}

const atomFunctionNames = [
  // Core
  'atom',
  'atomFamily',
  'atomWithDefault',
  'atomWithObservable',
  'atomWithReducer',
  'atomWithReset',
  'atomWithStorage',
  'freezeAtom',
  'loadable',
  'selectAtom',
  'splitAtom',
  'unwrap',
  // jotai-xstate
  'atomWithMachine',
  // jotai-immer
  'atomWithImmer',
  // jotai-valtio
  'atomWithProxy',
  // jotai-trpc + jotai-relay
  'atomWithQuery',
  'atomWithMutation',
  'atomWithSubscription',
  // jotai-redux + jotai-zustand
  'atomWithStore',
  // jotai-location
  'atomWithHash',
  'atomWithLocation',
  // jotai-optics
  'focusAtom',
  // jotai-form
  'atomWithValidate',
  'validateAtoms',
  // jotai-cache
  'atomWithCache',
  // jotai-recoil
  'atomWithRecoilValue',
  // jotai-tanstack-query
  'atomWithQuery',
  'atomWithQueries',
  'atomWithInfiniteQuery',
  'atomWithMutation',
  'atomWithSuspenseQuery',
  'atomWithSuspenseInfiniteQuery',
  'atomWithMutationState',
  // jotai-eager
  'eagerAtom',
  // jotai-effect
  'atomEffect',
];
