
declare module 'mocks' {
  export var http: {ServerRequest: any, ServerResponse: any}
  export var fs
  export var loadFile
  export var chokidar
}

declare module 'di' {
  export var Injector: any
}

declare module 'timer-shim' {
  export var Timer: any
}

declare var scheduleNextTick;
