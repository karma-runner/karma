import 'log4js';

declare module 'log4js' {
  export interface Logger {
    on: any
  }
}
