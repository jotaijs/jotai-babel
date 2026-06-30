import { transformSync } from '@babel/core';
import { expect, it } from 'vitest';
import plugin from 'jotai-babel/plugin-react-refresh';

const transform = (
  code: string,
  filename?: string,
  customAtomNames?: string[],
) =>
  transformSync(code, {
    babelrc: false,
    configFile: false,
    filename,
    root: '.',
    plugins: [[plugin, { customAtomNames }]],
  })?.code;

it('Should add a cache for a single atom', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
const countAtom = atom(0);`,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import { atom } from 'jotai';
    const countAtom = globalThis.jotaiAtomCache.get("/src/atoms/index.ts/countAtom", atom(0));"
  `);
});

it('Should add a cache for multiple atoms', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
  const countAtom = atom(0);
  const doubleAtom = atom((get) => get(countAtom) * 2);
  `,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import { atom } from 'jotai';
    const countAtom = globalThis.jotaiAtomCache.get("/src/atoms/index.ts/countAtom", atom(0));
    const doubleAtom = globalThis.jotaiAtomCache.get("/src/atoms/index.ts/doubleAtom", atom(get => get(countAtom) * 2));"
  `);
});

it('Should add a cache for multiple exported atoms', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
  export const countAtom = atom(0);
  export const doubleAtom = atom((get) => get(countAtom) * 2);
  `,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import { atom } from 'jotai';
    export const countAtom = globalThis.jotaiAtomCache.get("/src/atoms/index.ts/countAtom", atom(0));
    export const doubleAtom = globalThis.jotaiAtomCache.get("/src/atoms/index.ts/doubleAtom", atom(get => get(countAtom) * 2));"
  `);
});

it('Should add a cache for a default exported atom', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
export default atom(0);`,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import { atom } from 'jotai';
    export default globalThis.jotaiAtomCache.get("/src/atoms/index.ts/defaultExport", atom(0));"
  `);
});

it('Should add a cache for mixed exports of atoms', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
  export const countAtom = atom(0);
  export default atom((get) => get(countAtom) * 2);
  `,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import { atom } from 'jotai';
    export const countAtom = globalThis.jotaiAtomCache.get("/src/atoms/index.ts/countAtom", atom(0));
    export default globalThis.jotaiAtomCache.get("/src/atoms/index.ts/defaultExport", atom(get => get(countAtom) * 2));"
  `);
});

it('Should fail if no filename is available', () => {
  expect(() => transform(`const countAtom = atom(0);`)).toThrow(
    'Filename must be available',
  );
});

it('Should handle atoms returned from functions (#891)', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
function createAtom(label) {
    const anAtom = atom(0);
    anAtom.debugLabel = label;
    return anAtom;
  }
  
  const countAtom = atom(0);
  const countAtom2 = createAtom("countAtom2");
  const countAtom3 = createAtom("countAtom3");`,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import { atom } from 'jotai';
    function createAtom(label) {
      const anAtom = atom(0);
      anAtom.debugLabel = label;
      return anAtom;
    }
    const countAtom = globalThis.jotaiAtomCache.get("/src/atoms/index.ts/countAtom", atom(0));
    const countAtom2 = createAtom("countAtom2");
    const countAtom3 = createAtom("countAtom3");"
  `);
});

it('Should handle custom atom names', () => {
  expect(
    transform(
      `const mySpecialThing = myCustomAtom(0);`,
      '/src/atoms/index.ts',
      ['myCustomAtom'],
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    const mySpecialThing = globalThis.jotaiAtomCache.get("/src/atoms/index.ts/mySpecialThing", myCustomAtom(0));"
  `);
});

it('Should not transform atom-like functions not imported from jotai', () => {
  expect(
    transform(
      `import { unwrap } from 'some-other-lib';
const result = unwrap(something);`,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import { unwrap } from 'some-other-lib';
    const result = unwrap(something);"
  `);
});

it('Should not transform atom-like namespace calls not imported from jotai', () => {
  expect(
    transform(
      `import * as foo from 'some-other-lib';
const result = foo.atom(0);`,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import * as foo from 'some-other-lib';
    const result = foo.atom(0);"
  `);
});

it('Should not transform shadowed jotai named imports', () => {
  expect(
    transform(
      `import { atom } from 'jotai';
function create(atom) {
  const value = atom(0);
  return value;
}`,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import { atom } from 'jotai';
    function create(atom) {
      const value = atom(0);
      return value;
    }"
  `);
});

it('Should not transform shadowed jotai namespace imports', () => {
  expect(
    transform(
      `import * as jotai from 'jotai';
function create(jotai) {
  const value = jotai.atom(0);
  return value;
}`,
      '/src/atoms/index.ts',
    ),
  ).toMatchInlineSnapshot(`
    "globalThis.jotaiAtomCache = globalThis.jotaiAtomCache || {
      cache: new Map(),
      get(name, inst) {
        if (this.cache.has(name)) {
          return this.cache.get(name);
        }
        this.cache.set(name, inst);
        return inst;
      }
    };
    import * as jotai from 'jotai';
    function create(jotai) {
      const value = jotai.atom(0);
      return value;
    }"
  `);
});
