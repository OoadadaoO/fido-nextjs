# Yarn Monorepo

## More Features

### Top-level Await

Add a [`loader.js`](loader.js) file to the root of the project just like in the demo.

Use it as loader in the _repo_ `package.json` scripts.

```json
{
  "scripts": {
    "start": "node --import ../../loader.js dist/index.js"
  }
}
```

### Directory Import

In the _root_ `tsconfig.json`, set

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node"
  }
}
```

Let the _repo_ `tsconfig.json` inherit from the _root_ `tsconfig.json`.

```json
{
  "extends": "../../tsconfig.json"
}
```

### ESLint & Prettier

Add the _root_ `.eslintrc.cjs`, `tsconfig.eslint.json` just like in the demo.

Add the _root_ `.prettierrc.cjs` just like in the demo.
