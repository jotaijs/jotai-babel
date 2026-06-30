import babel, { types } from '@babel/core';

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

function isBindingImportedFromJotai(
  t: typeof types,
  name: string,
  path: babel.NodePath,
): boolean {
  const binding = path.scope.getBinding(name);
  if (!binding) return false;
  const bindingNode = binding.path.node;
  const bindingParent = binding.path.parent;
  return (
    (t.isImportSpecifier(bindingNode) ||
      t.isImportDefaultSpecifier(bindingNode)) &&
    t.isImportDeclaration(bindingParent) &&
    isJotaiSource(bindingParent.source.value)
  );
}

function isNamespaceBindingImportedFromJotai(
  t: typeof types,
  name: string,
  path: babel.NodePath,
): boolean {
  const binding = path.scope.getBinding(name);
  if (!binding) return false;
  const bindingNode = binding.path.node;
  const bindingParent = binding.path.parent;
  return (
    t.isImportNamespaceSpecifier(bindingNode) &&
    t.isImportDeclaration(bindingParent) &&
    isJotaiSource(bindingParent.source.value)
  );
}

export function isAtom(
  t: typeof types,
  callee: babel.types.Expression | babel.types.V8IntrinsicIdentifier,
  customAtomNames: PluginOptions['customAtomNames'] = [],
  callSitePath?: babel.NodePath,
): boolean {
  const atomNames = [...atomFunctionNames, ...customAtomNames];

  if (t.isIdentifier(callee) && atomNames.includes(callee.name)) {
    // Custom atom names always bypass the import check (explicit opt-in)
    if (customAtomNames.includes(callee.name)) return true;
    // When a call site path is provided, verify the binding resolves to jotai
    if (callSitePath) {
      return isBindingImportedFromJotai(t, callee.name, callSitePath);
    }
    return true;
  }

  if (t.isMemberExpression(callee)) {
    const { object, property } = callee;
    if (t.isIdentifier(property) && atomNames.includes(property.name)) {
      // Custom atom names always bypass the import check (explicit opt-in)
      if (customAtomNames.includes(property.name)) return true;
      // When a call site path is provided, verify the namespace binding resolves to jotai
      if (callSitePath && t.isIdentifier(object)) {
        return isNamespaceBindingImportedFromJotai(t, object.name, callSitePath);
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
