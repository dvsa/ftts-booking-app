/*
  Type file has been added as the npm package eslint-plugin-testcafe-community throws errors on one of
  it's dependecies types which causes the build to fail. As this is a es-lint plugin I don't see any issues
  having this workaround.
*/
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-empty-interface */
import 'estree';

declare module 'estree' {
  export interface ChainExpression {}
  export interface ImportExpression {}
}
