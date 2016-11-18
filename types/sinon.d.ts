import 'sinon';

declare module 'sinon' {
  interface SinonSpy {
    finished: any,
    _processes: any[]
  }
}
