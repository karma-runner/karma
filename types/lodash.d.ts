import 'lodash';

declare module "lodash" {
  interface LoDashStatic {
    pluck: any
  }
}
