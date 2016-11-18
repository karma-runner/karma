import 'sinon-chai'

declare global {
  export namespace Chai {
    interface Assertion {
      containSubset: Include;
      defined: any
      beServedAs: any
      beNotServed: any
    }

    interface Include {
      (...args): Assertion;
    }
  }
}
