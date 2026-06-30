import { transformSync } from '@babel/core';
import { expect, it } from 'vitest';
import plugin from 'jotai-babel/plugin-debug-label';

const transform = (
  code: string,
  filename?: string,
  customAtomNames?: string[],
) =>
  transformSync(code, {
    babelrc: false,
    configFile: false,
    filename,
    plugins: [[plugin, { customAtomNames }]],
  })?.code;

it('Should add a debugLabel to an atom', () => {
  expect(
    transform(`import { atom } from 'jotai';
const countAtom = atom(0);`),
  ).toMatchInlineSnapshot(`
    "import { atom } from 'jotai';
    const countAtom = atom(0);
    countAtom.debugLabel = "countAtom";"
  `);
});

it('Should handle a atom from a default export', () => {
  expect(
    transform(`import * as jotai from 'jotai';
const countAtom = jotai.atom(0);`),
  ).toMatchInlineSnapshot(`
    "import * as jotai from 'jotai';
    const countAtom = jotai.atom(0);
    countAtom.debugLabel = "countAtom";"
  `);
});

it('Should handle a atom being exported', () => {
  expect(
    transform(`import { atom } from 'jotai';
export const countAtom = atom(0);`),
  ).toMatchInlineSnapshot(`
    "import { atom } from 'jotai';
    export const countAtom = atom(0);
    countAtom.debugLabel = "countAtom";"
  `);
});

it('Should handle a default exported atom', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
export default atom(0);`,
      'countAtom.ts',
    ),
  ).toMatchInlineSnapshot(`
    "import { atom } from 'jotai';
    const countAtom = atom(0);
    countAtom.debugLabel = "countAtom";
    export default countAtom;"
  `);
});

it('Should handle a default exported atom in a barrel file', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
export default atom(0);`,
      'atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "import { atom } from 'jotai';
    const atoms = atom(0);
    atoms.debugLabel = "atoms";
    export default atoms;"
  `);
});

it('Should handle all types of exports', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
      export const countAtom = atom(0);
      export default atom(0);
    `,
      'atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "import { atom } from 'jotai';
    export const countAtom = atom(0);
    countAtom.debugLabel = "countAtom";
    const atoms = atom(0);
    atoms.debugLabel = "atoms";
    export default atoms;"
  `);
});

it('Should handle all atom types', () => {
  expect(
    transform(
      `
      import { atom, atomFamily } from 'jotai';
      import { atomWithDefault, atomWithObservable, atomWithReducer, atomWithReset, atomWithStorage, freezeAtom, loadable, selectAtom, splitAtom, unwrap } from 'jotai/utils';
      import { atomWithSubscription, atomWithStore } from 'jotai-redux';
      import { atomWithHash, atomWithLocation } from 'jotai-location';
      import { focusAtom } from 'jotai-optics';
      import { atomWithValidate, validateAtoms } from 'jotai-form';
      import { atomWithCache } from 'jotai-cache';
      import { atomWithRecoilValue } from 'jotai-recoil';
      export const countAtom = atom(0);
      const myFamily = atomFamily((param) => atom(param));
      const countAtomWithDefault = atomWithDefault((get) => get(countAtom) * 2);
      const observableAtom = atomWithObservable(() => {});
      const reducerAtom = atomWithReducer(0, () => {});
      const resetAtom = atomWithReset(0);
      const storageAtom = atomWithStorage('count', 1);
      const freezedAtom = freezeAtom(atom({ count: 0 }));
      const loadedAtom = loadable(countAtom);
      const selectedValueAtom = selectAtom(atom({ a: 0, b: 'othervalue' }), (v) => v.a);
      const splittedAtom = splitAtom(atom([]));

      const unwrappedAtom = unwrap(asyncArrayAtom, () => []);

      const someatomWithSubscription = atomWithSubscription(() => {});

      const someAtomWithStore = atomWithStore(() => {});

      const someAtomWithHash = atomWithHash('', '');
      
      const someAtomWithLocation = atomWithLocation();

      const someFocusAtom = focusAtom(someAtom, () => {});

      const someAtomWithValidate = atomWithValidate('', {});

      const someValidateAtoms = validateAtoms({}, () => {});

      const someAtomWithCache = atomWithCache(async () => {});

      const someAtomWithRecoilValue = atomWithRecoilValue({});
      
    `,
      'atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "import { atom, atomFamily } from 'jotai';
    import { atomWithDefault, atomWithObservable, atomWithReducer, atomWithReset, atomWithStorage, freezeAtom, loadable, selectAtom, splitAtom, unwrap } from 'jotai/utils';
    import { atomWithSubscription, atomWithStore } from 'jotai-redux';
    import { atomWithHash, atomWithLocation } from 'jotai-location';
    import { focusAtom } from 'jotai-optics';
    import { atomWithValidate, validateAtoms } from 'jotai-form';
    import { atomWithCache } from 'jotai-cache';
    import { atomWithRecoilValue } from 'jotai-recoil';
    export const countAtom = atom(0);
    countAtom.debugLabel = "countAtom";
    const myFamily = atomFamily(param => atom(param));
    myFamily.debugLabel = "myFamily";
    const countAtomWithDefault = atomWithDefault(get => get(countAtom) * 2);
    countAtomWithDefault.debugLabel = "countAtomWithDefault";
    const observableAtom = atomWithObservable(() => {});
    observableAtom.debugLabel = "observableAtom";
    const reducerAtom = atomWithReducer(0, () => {});
    reducerAtom.debugLabel = "reducerAtom";
    const resetAtom = atomWithReset(0);
    resetAtom.debugLabel = "resetAtom";
    const storageAtom = atomWithStorage('count', 1);
    storageAtom.debugLabel = "storageAtom";
    const freezedAtom = freezeAtom(atom({
      count: 0
    }));
    freezedAtom.debugLabel = "freezedAtom";
    const loadedAtom = loadable(countAtom);
    loadedAtom.debugLabel = "loadedAtom";
    const selectedValueAtom = selectAtom(atom({
      a: 0,
      b: 'othervalue'
    }), v => v.a);
    selectedValueAtom.debugLabel = "selectedValueAtom";
    const splittedAtom = splitAtom(atom([]));
    splittedAtom.debugLabel = "splittedAtom";
    const unwrappedAtom = unwrap(asyncArrayAtom, () => []);
    unwrappedAtom.debugLabel = "unwrappedAtom";
    const someatomWithSubscription = atomWithSubscription(() => {});
    someatomWithSubscription.debugLabel = "someatomWithSubscription";
    const someAtomWithStore = atomWithStore(() => {});
    someAtomWithStore.debugLabel = "someAtomWithStore";
    const someAtomWithHash = atomWithHash('', '');
    someAtomWithHash.debugLabel = "someAtomWithHash";
    const someAtomWithLocation = atomWithLocation();
    someAtomWithLocation.debugLabel = "someAtomWithLocation";
    const someFocusAtom = focusAtom(someAtom, () => {});
    someFocusAtom.debugLabel = "someFocusAtom";
    const someAtomWithValidate = atomWithValidate('', {});
    someAtomWithValidate.debugLabel = "someAtomWithValidate";
    const someValidateAtoms = validateAtoms({}, () => {});
    someValidateAtoms.debugLabel = "someValidateAtoms";
    const someAtomWithCache = atomWithCache(async () => {});
    someAtomWithCache.debugLabel = "someAtomWithCache";
    const someAtomWithRecoilValue = atomWithRecoilValue({});
    someAtomWithRecoilValue.debugLabel = "someAtomWithRecoilValue";"
  `);
});

it('Handles custom atom names a debugLabel to an atom', () => {
  expect(
    transform(`const mySpecialThing = myCustomAtom(0);`, undefined, [
      'myCustomAtom',
    ]),
  ).toMatchInlineSnapshot(`
    "const mySpecialThing = myCustomAtom(0);
    mySpecialThing.debugLabel = "mySpecialThing";"
  `);
});

it('Should not transform atom-like functions not imported from jotai', () => {
  expect(
    transform(`import { unwrap } from 'some-other-lib';
const result = unwrap(something);`),
  ).toMatchInlineSnapshot(`
    "import { unwrap } from 'some-other-lib';
    const result = unwrap(something);"
  `);
});

it('Should not transform atom-like namespace calls not imported from jotai', () => {
  expect(
    transform(`import * as foo from 'some-other-lib';
const result = foo.atom(0);`),
  ).toMatchInlineSnapshot(`
    "import * as foo from 'some-other-lib';
    const result = foo.atom(0);"
  `);
});

it('Should not transform shadowed jotai named imports', () => {
  expect(
    transform(`import { atom } from 'jotai';
function create(atom) {
  const value = atom(0);
  return value;
}`),
  ).toMatchInlineSnapshot(`
    "import { atom } from 'jotai';
    function create(atom) {
      const value = atom(0);
      return value;
    }"
  `);
});

it('Should not transform shadowed jotai namespace imports', () => {
  expect(
    transform(`import * as jotai from 'jotai';
function create(jotai) {
  const value = jotai.atom(0);
  return value;
}`),
  ).toMatchInlineSnapshot(`
    "import * as jotai from 'jotai';
    function create(jotai) {
      const value = jotai.atom(0);
      return value;
    }"
  `);
});
