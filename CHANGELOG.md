## [6.3.11](https://github.com/karma-runner/karma/compare/v6.3.10...v6.3.11) (2022-01-13)


### Bug Fixes

* **deps:** pin colors package to 1.4.0 due to security vulnerability ([a5219c5](https://github.com/karma-runner/karma/commit/a5219c52e2515248eefae4fe1863ac8ad3fdd43b))

## [6.3.10](https://github.com/karma-runner/karma/compare/v6.3.9...v6.3.10) (2022-01-08)


### Bug Fixes

* **logger:** create parent folders if they are missing ([0d24bd9](https://github.com/karma-runner/karma/commit/0d24bd937f7089d1456e2ecf04419d2c268c3144)), closes [#3734](https://github.com/karma-runner/karma/issues/3734)

## [6.3.9](https://github.com/karma-runner/karma/compare/v6.3.8...v6.3.9) (2021-11-16)


### Bug Fixes

* restartOnFileChange option not restarting the test run ([92ffe60](https://github.com/karma-runner/karma/commit/92ffe6018451f6144e8bc7726d304057b5ac9d0a)), closes [#27](https://github.com/karma-runner/karma/issues/27) [#3724](https://github.com/karma-runner/karma/issues/3724)

## [6.3.8](https://github.com/karma-runner/karma/compare/v6.3.7...v6.3.8) (2021-11-07)


### Bug Fixes

* **reporter:** warning if stack trace contains generated code invocation ([4f23b14](https://github.com/karma-runner/karma/commit/4f23b14d3e774c0401f2c9eecb188b37aed020eb))

## [6.3.7](https://github.com/karma-runner/karma/compare/v6.3.6...v6.3.7) (2021-11-01)


### Bug Fixes

* **middleware:** replace %X_UA_COMPATIBLE% marker anywhere in the file ([f1aeaec](https://github.com/karma-runner/karma/commit/f1aeaec09e49856747b8f650d06b4dcc61eb637e)), closes [#3711](https://github.com/karma-runner/karma/issues/3711)

## [6.3.6](https://github.com/karma-runner/karma/compare/v6.3.5...v6.3.6) (2021-10-25)


### Bug Fixes

* bump vulnerable ua-parser-js version ([6f2b2ec](https://github.com/karma-runner/karma/commit/6f2b2ec6ed0218980eabf2cbf44e0c8f16fee661)), closes [#3713](https://github.com/karma-runner/karma/issues/3713)

## [6.3.5](https://github.com/karma-runner/karma/compare/v6.3.4...v6.3.5) (2021-10-20)


### Bug Fixes

* **client:** prevent socket.io from hanging due to mocked clocks ([#3695](https://github.com/karma-runner/karma/issues/3695)) ([105da90](https://github.com/karma-runner/karma/commit/105da90a9975c1050f96cda966bd30a3c677494e))

## [6.3.4](https://github.com/karma-runner/karma/compare/v6.3.3...v6.3.4) (2021-06-14)


### Bug Fixes

* bump production dependencies within SemVer ranges ([#3682](https://github.com/karma-runner/karma/issues/3682)) ([36467a8](https://github.com/karma-runner/karma/commit/36467a8ac357108343dde4131ef34099004711e5)), closes [#3680](https://github.com/karma-runner/karma/issues/3680)

## [6.3.3](https://github.com/karma-runner/karma/compare/v6.3.2...v6.3.3) (2021-06-01)


### Bug Fixes

* **server:** clean up vestigial code from proxy ([#3640](https://github.com/karma-runner/karma/issues/3640)) ([f4aeac3](https://github.com/karma-runner/karma/commit/f4aeac313ec07d61ce42edc2bd7ae5392a7b3fbc)), closes [/tools.ietf.org/html/std66#section-3](https://github.com//tools.ietf.org/html/std66/issues/section-3)

## [6.3.2](https://github.com/karma-runner/karma/compare/v6.3.1...v6.3.2) (2021-03-29)


### Bug Fixes

* fix running tests in IE9 ([#3668](https://github.com/karma-runner/karma/issues/3668)) ([0055bc5](https://github.com/karma-runner/karma/commit/0055bc5cbf75597fa1601661bc4bec8cc701a49a)), closes [/github.com/karma-runner/karma/blob/026fff870913fb6cd2858dd962935dc74c92b725/client/main.js#L14](https://github.com//github.com/karma-runner/karma/blob/026fff870913fb6cd2858dd962935dc74c92b725/client/main.js/issues/L14) [#3665](https://github.com/karma-runner/karma/issues/3665)

## [6.3.1](https://github.com/karma-runner/karma/compare/v6.3.0...v6.3.1) (2021-03-24)


### Bug Fixes

* **client:** clearContext after complete sent ([#3657](https://github.com/karma-runner/karma/issues/3657)) ([c0962e3](https://github.com/karma-runner/karma/commit/c0962e34fb2c0a7a43bead8d600ad4a6dbb29c3d))

# [6.3.0](https://github.com/karma-runner/karma/compare/v6.2.0...v6.3.0) (2021-03-23)


### Features

* support asynchronous `config.set()` call in karma.conf.js ([#3660](https://github.com/karma-runner/karma/issues/3660)) ([4c9097a](https://github.com/karma-runner/karma/commit/4c9097a59c666671aaa55177e03e8738e047e886))

# [6.2.0](https://github.com/karma-runner/karma/compare/v6.1.2...v6.2.0) (2021-03-10)


### Features

* **plugins:** add support wildcard config for scoped package plugin ([#3659](https://github.com/karma-runner/karma/issues/3659)) ([39831b1](https://github.com/karma-runner/karma/commit/39831b1c2f9cbeebdba94c73ce353efb7c44e802))

## [6.1.2](https://github.com/karma-runner/karma/compare/v6.1.1...v6.1.2) (2021-03-09)


### Bug Fixes

* **commitlint:** skip task on master ([#3650](https://github.com/karma-runner/karma/issues/3650)) ([3fc6fda](https://github.com/karma-runner/karma/commit/3fc6fdadd6b0ed6838de048c15485b1bd815fe23))
* patch karma to allow loading virtual packages ([#3663](https://github.com/karma-runner/karma/issues/3663)) ([5bfcf5f](https://github.com/karma-runner/karma/commit/5bfcf5f37de6f0a12abcf9914c2fad510395b4d6))

## [6.1.1](https://github.com/karma-runner/karma/compare/v6.1.0...v6.1.1) (2021-02-12)


### Bug Fixes

* **config:** check extension before ts-node register ([#3651](https://github.com/karma-runner/karma/issues/3651)) ([474f4e1](https://github.com/karma-runner/karma/commit/474f4e1caff469cce87f19a11d9179e4e05552f9)), closes [#3329](https://github.com/karma-runner/karma/issues/3329)
* report launcher process error when exit event is not emitted ([#3647](https://github.com/karma-runner/karma/issues/3647)) ([7ab86be](https://github.com/karma-runner/karma/commit/7ab86be25c334b07747632b0a6bdb1d650d881bc))

# [6.1.0](https://github.com/karma-runner/karma/compare/v6.0.4...v6.1.0) (2021-02-03)


### Features

* **config:** improve `karma.config.parseConfig` error handling ([#3635](https://github.com/karma-runner/karma/issues/3635)) ([9dba1e2](https://github.com/karma-runner/karma/commit/9dba1e20af48d4885e1a1c6da8c08454acb0db9d))

## [6.0.4](https://github.com/karma-runner/karma/compare/v6.0.3...v6.0.4) (2021-02-01)


### Bug Fixes

* **cli:** temporarily disable strict parameters validation ([#3641](https://github.com/karma-runner/karma/issues/3641)) ([9c755e0](https://github.com/karma-runner/karma/commit/9c755e0d61f1e8fb0fed1281fc8a331d5f1734be)), closes [#3625](https://github.com/karma-runner/karma/issues/3625)
* **client:** fix a false positive page reload error in Safari ([#3643](https://github.com/karma-runner/karma/issues/3643)) ([2a57b23](https://github.com/karma-runner/karma/commit/2a57b230cd6b27e1a6e903ca6557c5a6b3e31bf6))
* ensure that Karma supports running tests on IE 11 ([#3642](https://github.com/karma-runner/karma/issues/3642)) ([dbd1943](https://github.com/karma-runner/karma/commit/dbd1943e6901c4cb86280db7663afde32f9ab86c))

## [6.0.3](https://github.com/karma-runner/karma/compare/v6.0.2...v6.0.3) (2021-01-27)


### Bug Fixes

* **plugins:** refactor instantiatePlugin from preproprocessor ([#3628](https://github.com/karma-runner/karma/issues/3628)) ([e02858a](https://github.com/karma-runner/karma/commit/e02858ae0d0de3f05add976b10e4b6b935cc3dd7))

## [6.0.2](https://github.com/karma-runner/karma/compare/v6.0.1...v6.0.2) (2021-01-25)


### Bug Fixes

* avoid ES6+ syntax in client scripts ([#3629](https://github.com/karma-runner/karma/issues/3629)) ([6629e96](https://github.com/karma-runner/karma/commit/6629e96901dbeae24fbaa4d0bfa009618fb8ee75)), closes [#3630](https://github.com/karma-runner/karma/issues/3630)

## [6.0.1](https://github.com/karma-runner/karma/compare/v6.0.0...v6.0.1) (2021-01-20)


### Bug Fixes

* **server:** set maxHttpBufferSize to the socket.io v2 default ([#3626](https://github.com/karma-runner/karma/issues/3626)) ([69baddc](https://github.com/karma-runner/karma/commit/69baddc843e4852a6770bfc1212fc2bce1f38fe7)), closes [#3621](https://github.com/karma-runner/karma/issues/3621)
* restore `customFileHandlers` provider ([#3624](https://github.com/karma-runner/karma/issues/3624)) ([25d9abb](https://github.com/karma-runner/karma/commit/25d9abb76929b6ea8abe1cf040ba6db2f269d50e))

# [6.0.0](https://github.com/karma-runner/karma/compare/v5.2.3...v6.0.0) (2021-01-13)


### Bug Fixes

* **ci:** abandon browserstack tests for Safari and IE ([#3615](https://github.com/karma-runner/karma/issues/3615)) ([04a811d](https://github.com/karma-runner/karma/commit/04a811dc7a4b37aa56c0405880f03cb2493bf820))
* **client:** do not reset karmaNavigating in unload handler ([#3591](https://github.com/karma-runner/karma/issues/3591)) ([4a8178f](https://github.com/karma-runner/karma/commit/4a8178f3a0504ef007b23ef0fd8f5ca128f0c5c6)), closes [#3482](https://github.com/karma-runner/karma/issues/3482)
* **context:** do not error when karma is navigating ([#3565](https://github.com/karma-runner/karma/issues/3565)) ([05dc288](https://github.com/karma-runner/karma/commit/05dc28801627e3ce7054ae548046714dc2cf7a5e)), closes [#3560](https://github.com/karma-runner/karma/issues/3560)
* **cve:** update ua-parser-js to 0.7.23 to fix CVE-2020-7793 ([#3584](https://github.com/karma-runner/karma/issues/3584)) ([f819fa8](https://github.com/karma-runner/karma/commit/f819fa843fa0633edbe2af6ac2889e25ea2cb639))
* **cve:** update yargs to 16.1.1 to fix cve-2020-7774 in y18n ([#3578](https://github.com/karma-runner/karma/issues/3578)) ([3fed0bc](https://github.com/karma-runner/karma/commit/3fed0bc7dd042a09c8aec55c059654781a4584ec)), closes [#3577](https://github.com/karma-runner/karma/issues/3577)
* **deps:** bump socket-io to v3 ([#3586](https://github.com/karma-runner/karma/issues/3586)) ([1b9e1de](https://github.com/karma-runner/karma/commit/1b9e1de7d081e1c205debff27c6b5e1fe0585dee)), closes [#3569](https://github.com/karma-runner/karma/issues/3569)
* **middleware:** catch errors when loading a module ([#3605](https://github.com/karma-runner/karma/issues/3605)) ([fec972f](https://github.com/karma-runner/karma/commit/fec972ff63760f9606a4cef7673a68c55c880722)), closes [#3572](https://github.com/karma-runner/karma/issues/3572)
* **server:** clean up close-server logic ([#3607](https://github.com/karma-runner/karma/issues/3607)) ([3fca456](https://github.com/karma-runner/karma/commit/3fca456a02a65304d6423d6311fb55f83e73d85e))
* **test:** clear up clearContext ([#3597](https://github.com/karma-runner/karma/issues/3597)) ([8997b74](https://github.com/karma-runner/karma/commit/8997b7465de3c5f7e436078b57acae98de1ce39a))
* **test:** mark all second connections reconnects ([#3598](https://github.com/karma-runner/karma/issues/3598)) ([1c9c2de](https://github.com/karma-runner/karma/commit/1c9c2de54fa1abcb2c0edceebb159440b77e4863))


### Features

* **cli:** error out on unexpected options or parameters ([#3589](https://github.com/karma-runner/karma/issues/3589)) ([603bbc0](https://github.com/karma-runner/karma/commit/603bbc0db2ef4e6b8474f97a8255587f2a5f924e))
* **client:** update banner with connection, test status, ping times ([#3611](https://github.com/karma-runner/karma/issues/3611)) ([4bf90f7](https://github.com/karma-runner/karma/commit/4bf90f70f46cddf52a55d8f2b9ce0ccd2d4a4d3b))
* **server:** print stack of unhandledrejections ([#3593](https://github.com/karma-runner/karma/issues/3593)) ([35a5842](https://github.com/karma-runner/karma/commit/35a584234b00297dc511300bb6e42eeaceac8345))
* **server:** remove deprecated static methods ([#3595](https://github.com/karma-runner/karma/issues/3595)) ([1a65bf1](https://github.com/karma-runner/karma/commit/1a65bf1181bc9eb5c28ba0130ab7d90e89b21918))
* remove support for running dart code in the browser ([#3592](https://github.com/karma-runner/karma/issues/3592)) ([7a3bd55](https://github.com/karma-runner/karma/commit/7a3bd5545fa1307c754419252fa35ff0b7572ae4))


### BREAKING CHANGES

* **server:** Deprecated `require('karma').server.start()` and `require('karma').Server.start()` variants were removed from the public API. Instead use canonical form:

```
const { Server } = require('karma');
const server = new Server();
server.start();
```
* **cli:** Karma is more strict and will error out if unknown option or argument is passed to CLI.
* Using Karma to run Dart code in the browser is no longer supported. Use your favorite Dart-to-JS compiler instead.

`dart` file type has been removed without a replacement.

`customFileHandlers` DI token has been removed. Use [`middleware`](https://karma-runner.github.io/5.2/config/configuration-file.html#middleware) to achieve similar functionality.

`customScriptTypes` DI token has been removed. It had no effect, so no replacement is provided.
* **deps:** Some projects have socket.io tests that are version sensitive.

## [5.2.3](https://github.com/karma-runner/karma/compare/v5.2.2...v5.2.3) (2020-09-25)


### Bug Fixes

* update us-parser-js dependency ([#3564](https://github.com/karma-runner/karma/issues/3564)) ([500ed25](https://github.com/karma-runner/karma/commit/500ed25d7e523efe7e7cff2ec70830be7e6e797a))

## [5.2.2](https://github.com/karma-runner/karma/compare/v5.2.1...v5.2.2) (2020-09-08)


### Bug Fixes

* revert source-map update ([#3559](https://github.com/karma-runner/karma/issues/3559)) ([d9ba284](https://github.com/karma-runner/karma/commit/d9ba2849ced403a2ff2574d8e3a14deee21f1cc4)), closes [#3557](https://github.com/karma-runner/karma/issues/3557)

## [5.2.1](https://github.com/karma-runner/karma/compare/v5.2.0...v5.2.1) (2020-09-02)


### Bug Fixes

* remove broken link from docs - 06-angularjs.md ([#3555](https://github.com/karma-runner/karma/issues/3555)) ([da2f307](https://github.com/karma-runner/karma/commit/da2f307603dbdeb9b49e30ebdbbe9ce68ccc2e9e))
* remove unused JSON utilities and flatted dependency ([#3550](https://github.com/karma-runner/karma/issues/3550)) ([beed255](https://github.com/karma-runner/karma/commit/beed255698c2efb3b7139f2145123829578345f6))

# [5.2.0](https://github.com/karma-runner/karma/compare/v5.1.1...v5.2.0) (2020-08-31)


### Bug Fixes

* **client:** avoid race between execute and clearContext ([#3452](https://github.com/karma-runner/karma/issues/3452)) ([8bc5b46](https://github.com/karma-runner/karma/commit/8bc5b468393bb90c0cac8f400d61e3434596c05a)), closes [#3424](https://github.com/karma-runner/karma/issues/3424)
* **client:** check in bundled client code into version control ([#3524](https://github.com/karma-runner/karma/issues/3524)) ([6cd5a3b](https://github.com/karma-runner/karma/commit/6cd5a3b091490ad1c621710456f359213f0c161e)), closes [/github.com/karma-runner/karma/commit/f5521df7df5cd1201b5dce28dc4e326b1ffc41fd#commitcomment-38967493](https://github.com//github.com/karma-runner/karma/commit/f5521df7df5cd1201b5dce28dc4e326b1ffc41fd/issues/commitcomment-38967493)
* **dependencies:** update dependencies ([#3543](https://github.com/karma-runner/karma/issues/3543)) ([5db46b7](https://github.com/karma-runner/karma/commit/5db46b799b84a3d29157edfdbb8d0d0bc57f8fbc))
* **docs:** Update 03-how-it-works.md ([#3539](https://github.com/karma-runner/karma/issues/3539)) ([e7cf7b1](https://github.com/karma-runner/karma/commit/e7cf7b11ca3f70a6401c0499376f78984b18e1cc))
* **server:** log error when file loading or preprocessing fails ([#3540](https://github.com/karma-runner/karma/issues/3540)) ([fc2fd61](https://github.com/karma-runner/karma/commit/fc2fd6102a1c6ed2972ab5bdec29d8747f1b8e64))


### Features

* **server:** allow 'exit' listeners to set exit code ([#3541](https://github.com/karma-runner/karma/issues/3541)) ([7a94d33](https://github.com/karma-runner/karma/commit/7a94d33ab60b1924fd760b4675254d1edea5dd0a))

## [5.1.1](https://github.com/karma-runner/karma/compare/v5.1.0...v5.1.1) (2020-07-28)


### Bug Fixes

* **server:** echo the hostname rather than listenAddress ([#3532](https://github.com/karma-runner/karma/issues/3532)) ([ebe7ce4](https://github.com/karma-runner/karma/commit/ebe7ce4c1aaa7637f2acfde6647f5766347ae1f5))

# [5.1.0](https://github.com/karma-runner/karma/compare/v5.0.9...v5.1.0) (2020-06-11)


### Features

* **proxy:** use keepAlive agent ([#3527](https://github.com/karma-runner/karma/issues/3527)) ([b77f94c](https://github.com/karma-runner/karma/commit/b77f94c1c95d0f717866eae42d478d09544b6d9d))

## [5.0.9](https://github.com/karma-runner/karma/compare/v5.0.8...v5.0.9) (2020-05-19)


### Bug Fixes

* **dependencies:** update to safe version of http-proxy ([#3519](https://github.com/karma-runner/karma/issues/3519)) ([00347bb](https://github.com/karma-runner/karma/commit/00347bb204c8c87e1096679af4634032d6600b67)), closes [#3510](https://github.com/karma-runner/karma/issues/3510)

## [5.0.8](https://github.com/karma-runner/karma/compare/v5.0.7...v5.0.8) (2020-05-18)


### Bug Fixes

* **dependencies:** update and unlock socket.io dependency ([#3513](https://github.com/karma-runner/karma/issues/3513)) ([b60391f](https://github.com/karma-runner/karma/commit/b60391fbddcfa5f8c50b6ac6e3c8d8d845258a56))
* **dependencies:** update to latest log4js major ([#3514](https://github.com/karma-runner/karma/issues/3514)) ([47f1cb2](https://github.com/karma-runner/karma/commit/47f1cb222ee0921defbe313b694da3288a894fec))

## [5.0.7](https://github.com/karma-runner/karma/compare/v5.0.6...v5.0.7) (2020-05-16)


### Bug Fixes

* detect type for URLs with query parameter or fragment identifier ([#3509](https://github.com/karma-runner/karma/issues/3509)) ([f399063](https://github.com/karma-runner/karma/commit/f399063d1bc8954dba74166ea3dabef2fe376ae4)), closes [#3497](https://github.com/karma-runner/karma/issues/3497)

## [5.0.6](https://github.com/karma-runner/karma/compare/v5.0.5...v5.0.6) (2020-05-16)


### Bug Fixes

* **dependencies:** update production dependencies ([#3512](https://github.com/karma-runner/karma/issues/3512)) ([0cd696f](https://github.com/karma-runner/karma/commit/0cd696fe91f2616f6646ea5c67cc44b49d7e941a))

## [5.0.5](https://github.com/karma-runner/karma/compare/v5.0.4...v5.0.5) (2020-05-07)


### Bug Fixes

* **cli:** restore command line help contents ([#3502](https://github.com/karma-runner/karma/issues/3502)) ([e99da31](https://github.com/karma-runner/karma/commit/e99da316a2d3f875f45baf4e985e521a2fcc755f)), closes [#3474](https://github.com/karma-runner/karma/issues/3474)

## [5.0.4](https://github.com/karma-runner/karma/compare/v5.0.3...v5.0.4) (2020-04-30)


### Bug Fixes

* **browser:** make sure that empty results array is still recognized ([#3486](https://github.com/karma-runner/karma/issues/3486)) ([fa95fa3](https://github.com/karma-runner/karma/commit/fa95fa3c917470fa4b9ad736287379d1e9ebb350))

## [5.0.3](https://github.com/karma-runner/karma/compare/v5.0.2...v5.0.3) (2020-04-29)


### Bug Fixes

* **client:** flush resultsBuffer on engine upgrade ([#3212](https://github.com/karma-runner/karma/issues/3212)) ([e44ca94](https://github.com/karma-runner/karma/commit/e44ca944fe94ae455cd6dc45d9985a6d9fb94754)), closes [#3211](https://github.com/karma-runner/karma/issues/3211)

## [5.0.2](https://github.com/karma-runner/karma/compare/v5.0.1...v5.0.2) (2020-04-16)


### Bug Fixes

* **ci:** stop the proxy before killing the child, handle errors ([#3472](https://github.com/karma-runner/karma/issues/3472)) ([abe9af6](https://github.com/karma-runner/karma/commit/abe9af616f7a08f3c64cc06f6a68bd5f9c941133)), closes [#3464](https://github.com/karma-runner/karma/issues/3464)

## [5.0.1](https://github.com/karma-runner/karma/compare/v5.0.0...v5.0.1) (2020-04-10)


### Bug Fixes

* **file-list:** do not define fs.statAsync ([#3467](https://github.com/karma-runner/karma/issues/3467)) ([55a59e7](https://github.com/karma-runner/karma/commit/55a59e70017af79d6f3c170d87d808acc8e21faf))

# [5.0.0](https://github.com/karma-runner/karma/compare/v4.4.1...v5.0.0) (2020-04-09)


### Bug Fixes

* install semantic-release as a regular dev dependency ([#3455](https://github.com/karma-runner/karma/issues/3455)) ([1eaf35e](https://github.com/karma-runner/karma/commit/1eaf35e1d616a2ef21dd00d843552f189fbc7c94))
* **ci:** echo travis env that gates release after_success ([#3446](https://github.com/karma-runner/karma/issues/3446)) ([b8b2ed8](https://github.com/karma-runner/karma/commit/b8b2ed81e595baf0337c9628a736494b9f2c91c1))
* **ci:** poll every 10s to avoid rate limit. ([#3388](https://github.com/karma-runner/karma/issues/3388)) ([91e7e00](https://github.com/karma-runner/karma/commit/91e7e00b29db95ea7209f60c07431b10ab597b02))
* **middleware/runner:** handle file list rejections ([#3400](https://github.com/karma-runner/karma/issues/3400)) ([80febfb](https://github.com/karma-runner/karma/commit/80febfb53a7d041bdcbcffef617e53cdc2d8dd66)), closes [#3396](https://github.com/karma-runner/karma/issues/3396) [#3396](https://github.com/karma-runner/karma/issues/3396)
* **server:** cleanup import of the removed method ([#3439](https://github.com/karma-runner/karma/issues/3439)) ([cb1bcbf](https://github.com/karma-runner/karma/commit/cb1bcbf0b33c8b14a823f7c2cfb7003a7d7704e5))
* **server:** createPreprocessor was removed ([#3435](https://github.com/karma-runner/karma/issues/3435)) ([5c334f5](https://github.com/karma-runner/karma/commit/5c334f5e811c490f49e4e681e38345776b77210a))
* **server:** detection new MS Edge Chromium ([#3440](https://github.com/karma-runner/karma/issues/3440)) ([7166ce2](https://github.com/karma-runner/karma/commit/7166ce2b965a44c89010271fda908e2d58a10a9a))
* **server:** replace optimist on yargs lib ([#3451](https://github.com/karma-runner/karma/issues/3451)) ([ec1e69a](https://github.com/karma-runner/karma/commit/ec1e69a2545695ee248f34c26f7c4c2b50439b94)), closes [#2473](https://github.com/karma-runner/karma/issues/2473)
* **server:** Report original error message ([#3415](https://github.com/karma-runner/karma/issues/3415)) ([79ee331](https://github.com/karma-runner/karma/commit/79ee331c939b7fb76a826d9216fea5fabc646854)), closes [#3414](https://github.com/karma-runner/karma/issues/3414)


### Code Refactoring

* use native Promise instead of Bluebird ([#3436](https://github.com/karma-runner/karma/issues/3436)) ([33a069f](https://github.com/karma-runner/karma/commit/33a069f8a4c4687cdbe07971cca479d98b262e3f)), closes [/github.com/karma-runner/karma/pull/3060#discussion_r284797390](https://github.com//github.com/karma-runner/karma/pull/3060/issues/discussion_r284797390)


### Continuous Integration

* drop node 8, adopt node 12 ([#3430](https://github.com/karma-runner/karma/issues/3430)) ([a673aa8](https://github.com/karma-runner/karma/commit/a673aa8ad76f733565498f2aab13fcd720502be1))


### Features

* **docs:** document `DEFAULT_LISTEN_ADDR` constant ([#3443](https://github.com/karma-runner/karma/issues/3443)) ([057d527](https://github.com/karma-runner/karma/commit/057d527262f1e258f53985116cba718268f108da)), closes [#2479](https://github.com/karma-runner/karma/issues/2479)
* **karma-server:** added log to the server.js for uncaught exception ([#3399](https://github.com/karma-runner/karma/issues/3399)) ([adc6a66](https://github.com/karma-runner/karma/commit/adc6a66943c93185e8481060c3cf4b7416985151))
* **preprocessor:** obey Pattern.isBinary when set ([#3422](https://github.com/karma-runner/karma/issues/3422)) ([708ae13](https://github.com/karma-runner/karma/commit/708ae133acc233195ea64657cafbb86cbd56f115)), closes [#3405](https://github.com/karma-runner/karma/issues/3405)


### BREAKING CHANGES

* Karma plugins which rely on the fact that Karma uses Bluebird promises may break as Bluebird-specific API is no longer available on Promises returned by the Karma core
* **server:** Deprecated createPreprocessor removed, karma-browserify < 7 version doesn't work
* no more testing on node 8.

<a name="4.4.1"></a>
## [4.4.1](https://github.com/karma-runner/karma/compare/v4.4.0...v4.4.1) (2019-10-18)


### Bug Fixes

* **deps:** back to karma-browserstack-launcher 1.4 ([#3361](https://github.com/karma-runner/karma/issues/3361)) ([1cd87ad](https://github.com/karma-runner/karma/commit/1cd87ad))
* **server:** Add test coverage for config.singleRun true branch. ([#3384](https://github.com/karma-runner/karma/issues/3384)) ([259be0d](https://github.com/karma-runner/karma/commit/259be0d))
* if preprocessor is async function and doesn't return a content then await donePromise ([#3387](https://github.com/karma-runner/karma/issues/3387)) ([f91be24](https://github.com/karma-runner/karma/commit/f91be24))



<a name="4.4.0"></a>
# [4.4.0](https://github.com/karma-runner/karma/compare/v4.3.0...v4.4.0) (2019-10-17)


### Bug Fixes

* **runner:** remove explicit error on all tests failed ([#3369](https://github.com/karma-runner/karma/issues/3369)) ([f8005c6](https://github.com/karma-runner/karma/commit/f8005c6)), closes [#3367](https://github.com/karma-runner/karma/issues/3367)


### Features

* **client:** Add trusted types support ([#3360](https://github.com/karma-runner/karma/issues/3360)) ([019bfd4](https://github.com/karma-runner/karma/commit/019bfd4))
* Preprocessor can return Promise ([#3376](https://github.com/karma-runner/karma/issues/3376)) ([3ffcd83](https://github.com/karma-runner/karma/commit/3ffcd83))
* **config:** add failOnSkippedTests option. ([#3374](https://github.com/karma-runner/karma/issues/3374)) ([4ed3af0](https://github.com/karma-runner/karma/commit/4ed3af0))
* **config:** clientDisplayNone sets client elements display none. ([#3348](https://github.com/karma-runner/karma/issues/3348)) ([6235e68](https://github.com/karma-runner/karma/commit/6235e68))
* **deps:** Remove core-js dependency. ([#3379](https://github.com/karma-runner/karma/issues/3379)) ([0d70809](https://github.com/karma-runner/karma/commit/0d70809))



<a name="4.3.0"></a>
# [4.3.0](https://github.com/karma-runner/karma/compare/v4.2.0...v4.3.0) (2019-08-27)


### Bug Fixes

* **build:** switch from yarn to package-lock.json ([#3351](https://github.com/karma-runner/karma/issues/3351)) ([6c5add2](https://github.com/karma-runner/karma/commit/6c5add2))
* **config:** Simpilfy error proceesing. ([#3345](https://github.com/karma-runner/karma/issues/3345)) ([582a406](https://github.com/karma-runner/karma/commit/582a406)), closes [#3339](https://github.com/karma-runner/karma/issues/3339)
* **deps:** lodash update. ([#3341](https://github.com/karma-runner/karma/issues/3341)) ([5614c04](https://github.com/karma-runner/karma/commit/5614c04))
* **server:** Simplify 'dom' inclusion. ([#3356](https://github.com/karma-runner/karma/issues/3356)) ([5f13e11](https://github.com/karma-runner/karma/commit/5f13e11))
* **test:** `test:client` silently failing on Travis ([#3343](https://github.com/karma-runner/karma/issues/3343)) ([1489e9a](https://github.com/karma-runner/karma/commit/1489e9a)), closes [/travis-ci.org/karma-runner/karma/jobs/537027667#L1046](https://github.com//travis-ci.org/karma-runner/karma/jobs/537027667/issues/L1046)
* **travis:** Pin to trusty ([#3347](https://github.com/karma-runner/karma/issues/3347)) ([1c6c690](https://github.com/karma-runner/karma/commit/1c6c690))


### Features

* **async:** frameworks can be loaded asynchronously ([#3297](https://github.com/karma-runner/karma/issues/3297)) ([177e2ef](https://github.com/karma-runner/karma/commit/177e2ef)), closes [#851](https://github.com/karma-runner/karma/issues/851)
* **config:** socket.io server pingTimeout config option. ([#3355](https://github.com/karma-runner/karma/issues/3355)) ([817fbbd](https://github.com/karma-runner/karma/commit/817fbbd))
* **preprocessor:** preprocessor_priority execution order. ([#3303](https://github.com/karma-runner/karma/issues/3303)) ([c5f3560](https://github.com/karma-runner/karma/commit/c5f3560))
* **runner:** feat(runner):  ([62d4c5a](https://github.com/karma-runner/karma/commit/62d4c5a)), closes [#2121](https://github.com/karma-runner/karma/issues/2121) [#2799](https://github.com/karma-runner/karma/issues/2799) [#2121](https://github.com/karma-runner/karma/issues/2121) [#2799](https://github.com/karma-runner/karma/issues/2799)



<a name="4.2.0"></a>
# [4.2.0](https://github.com/karma-runner/karma/compare/v4.1.0...v4.2.0) (2019-07-12)


### Bug Fixes

* **logging:** Util inspect for logging the config. ([#3332](https://github.com/karma-runner/karma/issues/3332)) ([70b72a9](https://github.com/karma-runner/karma/commit/70b72a9))
* **reporter:** format stack with 1-based column ([#3325](https://github.com/karma-runner/karma/issues/3325)) ([182c04d](https://github.com/karma-runner/karma/commit/182c04d)), closes [#3324](https://github.com/karma-runner/karma/issues/3324)
* **server:** Add error handler for webserver socket. ([#3300](https://github.com/karma-runner/karma/issues/3300)) ([fe9a1dd](https://github.com/karma-runner/karma/commit/fe9a1dd))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/karma-runner/karma/compare/v4.0.1...v4.1.0) (2019-04-15)


### Bug Fixes

* **client:** Enable loading different file types when running in parent mode without iframe ([#3289](https://github.com/karma-runner/karma/issues/3289)) ([7968db6](https://github.com/karma-runner/karma/commit/7968db6))
* **client:** Only create the funky object if message is not a string ([#3298](https://github.com/karma-runner/karma/issues/3298)) ([ce6825f](https://github.com/karma-runner/karma/commit/ce6825f)), closes [#3296](https://github.com/karma-runner/karma/issues/3296)
* **launcher:** Log state transitions in debug ([#3294](https://github.com/karma-runner/karma/issues/3294)) ([6556ab4](https://github.com/karma-runner/karma/commit/6556ab4)), closes [#3290](https://github.com/karma-runner/karma/issues/3290)
* **middleware:** log invalid filetype ([#3292](https://github.com/karma-runner/karma/issues/3292)) ([7eb48c5](https://github.com/karma-runner/karma/commit/7eb48c5)), closes [#3291](https://github.com/karma-runner/karma/issues/3291)



<a name="4.0.1"></a>
## [4.0.1](https://github.com/karma-runner/karma/compare/v4.0.0...v4.0.1) (2019-02-28)


### Bug Fixes

* **browser:** allow updating total specs count ([#3264](https://github.com/karma-runner/karma/issues/3264)) ([d5df723](https://github.com/karma-runner/karma/commit/d5df723))
* remove vulnerable dependency combine-lists ([#3273](https://github.com/karma-runner/karma/issues/3273)) ([c43f584](https://github.com/karma-runner/karma/commit/c43f584)), closes [#3265](https://github.com/karma-runner/karma/issues/3265)
* remove vulnerable dependency expand-braces ([#3270](https://github.com/karma-runner/karma/issues/3270)) ([4ec4f6f](https://github.com/karma-runner/karma/commit/4ec4f6f)), closes [#3268](https://github.com/karma-runner/karma/issues/3268) [#3269](https://github.com/karma-runner/karma/issues/3269)
* **filelist:** correct logger name. ([#3262](https://github.com/karma-runner/karma/issues/3262)) ([375bb5e](https://github.com/karma-runner/karma/commit/375bb5e))
* **launcher:** Debug Child Processes exit signal ([#3259](https://github.com/karma-runner/karma/issues/3259)) ([c277a6b](https://github.com/karma-runner/karma/commit/c277a6b))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/karma-runner/karma/compare/v3.1.4...v4.0.0) (2019-01-23)


### Bug Fixes

* **client:** fix issue with loaded on safari 10 ([#3252](https://github.com/karma-runner/karma/issues/3252)) ([571191c](https://github.com/karma-runner/karma/commit/571191c)), closes [#3198](https://github.com/karma-runner/karma/issues/3198)
* **config:** add test:unit npm script ([#3242](https://github.com/karma-runner/karma/issues/3242)) ([02f071d](https://github.com/karma-runner/karma/commit/02f071d))


### Chores

* remove support for node 6 ([#3246](https://github.com/karma-runner/karma/issues/3246)) ([8a83990](https://github.com/karma-runner/karma/commit/8a83990)), closes [#3151](https://github.com/karma-runner/karma/issues/3151)


### BREAKING CHANGES

* Drop Support for Node 6, to make it possible to use async/await in karma codebase.



<a name="3.1.4"></a>
## [3.1.4](https://github.com/karma-runner/karma/compare/v3.1.3...v3.1.4) (2018-12-17)


### Bug Fixes

* **file-list:** revert "do not preprocess up-to-date files" ([#3226](https://github.com/karma-runner/karma/issues/3226)) ([#3230](https://github.com/karma-runner/karma/issues/3230)) ([bb022a7](https://github.com/karma-runner/karma/commit/bb022a7))
* improve error msg when bin is a directory ([#3231](https://github.com/karma-runner/karma/issues/3231)) ([584dddc](https://github.com/karma-runner/karma/commit/584dddc))
* restarted browsers not running tests ([#3233](https://github.com/karma-runner/karma/issues/3233)) ([cc2eff2](https://github.com/karma-runner/karma/commit/cc2eff2))



<a name="3.1.3"></a>
## [3.1.3](https://github.com/karma-runner/karma/compare/v3.1.2...v3.1.3) (2018-12-01)


### Bug Fixes

* add missing dep flatted ([#3223](https://github.com/karma-runner/karma/issues/3223)) ([655d4d2](https://github.com/karma-runner/karma/commit/655d4d2))



<a name="3.1.2"></a>
## [3.1.2](https://github.com/karma-runner/karma/compare/v3.1.1...v3.1.2) (2018-12-01)


### Bug Fixes

* **browser:** report errors to console during singleRun=false ([#3209](https://github.com/karma-runner/karma/issues/3209)) ([30ff73b](https://github.com/karma-runner/karma/commit/30ff73b)), closes [#3131](https://github.com/karma-runner/karma/issues/3131)
* **changelog:** remove release which does not exist ([#3214](https://github.com/karma-runner/karma/issues/3214)) ([4e87902](https://github.com/karma-runner/karma/commit/4e87902))
* **dep:** Bump useragent to fix HeadlessChrome version ([#3201](https://github.com/karma-runner/karma/issues/3201)) ([240209f](https://github.com/karma-runner/karma/commit/240209f)), closes [#2762](https://github.com/karma-runner/karma/issues/2762)
* **deps:** upgrade sinon-chai 2.x -> 3.x ([#3207](https://github.com/karma-runner/karma/issues/3207)) ([dc5f5de](https://github.com/karma-runner/karma/commit/dc5f5de))
* **file-list:** do not preprocess up-to-date files ([#3196](https://github.com/karma-runner/karma/issues/3196)) ([5334d1a](https://github.com/karma-runner/karma/commit/5334d1a)), closes [#2829](https://github.com/karma-runner/karma/issues/2829)
* **package:** bump lodash version ([#3203](https://github.com/karma-runner/karma/issues/3203)) ([d38f344](https://github.com/karma-runner/karma/commit/d38f344)), closes [#3177](https://github.com/karma-runner/karma/issues/3177)
* **server:** use flatted for json.stringify ([#3220](https://github.com/karma-runner/karma/issues/3220)) ([fb05fb1](https://github.com/karma-runner/karma/commit/fb05fb1)), closes [#3215](https://github.com/karma-runner/karma/issues/3215)


### Features

* **docs:** callout the key debug strategies. ([#3219](https://github.com/karma-runner/karma/issues/3219)) ([2682bff](https://github.com/karma-runner/karma/commit/2682bff))



<a name="3.1.1"></a>
## [3.1.1](https://github.com/karma-runner/karma/compare/v3.1.0...v3.1.1) (2018-10-23)


### Bug Fixes

* **config:** move puppeteer from dependency to dev-dependency ([#3193](https://github.com/karma-runner/karma/issues/3193)) ([f0d52ad](https://github.com/karma-runner/karma/commit/f0d52ad)), closes [#3191](https://github.com/karma-runner/karma/issues/3191)



<a name="3.1.0"></a>
# [3.1.0](https://github.com/karma-runner/karma/compare/v3.0.0...v3.1.0) (2018-10-22)


### Bug Fixes

* work around broken console methods ([873e4f9](https://github.com/karma-runner/karma/commit/873e4f9)), closes [/github.com/angular/angular.js/pull/16644#issuecomment-407680658](https://github.com//github.com/angular/angular.js/pull/16644/issues/issuecomment-407680658)
* **browser:** emit 'browsers_change' in collection ([#3183](https://github.com/karma-runner/karma/issues/3183)) ([7634e71](https://github.com/karma-runner/karma/commit/7634e71))
* **config:** remove phantomjs in favor of chrome headless ([#3175](https://github.com/karma-runner/karma/issues/3175)) ([0f8b2b1](https://github.com/karma-runner/karma/commit/0f8b2b1))
* **init:** Support ChromeHeadless in `validateBrowser` ([#3110](https://github.com/karma-runner/karma/issues/3110)) ([eeadcf2](https://github.com/karma-runner/karma/commit/eeadcf2))
* **middleware:** simplify stripHost. ([#3115](https://github.com/karma-runner/karma/issues/3115)) ([d65e911](https://github.com/karma-runner/karma/commit/d65e911))
* **runner:** Do not persist grep option across runs ([#3121](https://github.com/karma-runner/karma/issues/3121)) ([c91cb81](https://github.com/karma-runner/karma/commit/c91cb81))
* **runner:** Make exit code configurable when tests are failing ([#3116](https://github.com/karma-runner/karma/issues/3116)) ([74da748](https://github.com/karma-runner/karma/commit/74da748)), closes [#1300](https://github.com/karma-runner/karma/issues/1300)
* **test/client:** revert const/let changes. ([c097ecf](https://github.com/karma-runner/karma/commit/c097ecf))


### Features

* **config:** Add config option for browser socket timeout ([#3102](https://github.com/karma-runner/karma/issues/3102)) ([11e3a9d](https://github.com/karma-runner/karma/commit/11e3a9d)), closes [#2927](https://github.com/karma-runner/karma/issues/2927)
* **config:** add support for ES modules ([e811adb](https://github.com/karma-runner/karma/commit/e811adb))
* **frameworks:** report start() errors back to server. ([#3126](https://github.com/karma-runner/karma/issues/3126)) ([8257375](https://github.com/karma-runner/karma/commit/8257375))
* **server:** .dom files include HTML tags in page. ([#3178](https://github.com/karma-runner/karma/issues/3178)) ([4651524](https://github.com/karma-runner/karma/commit/4651524))
* **server:** Add public API to force a file refresh ([dab8a82](https://github.com/karma-runner/karma/commit/dab8a82))
* **server:** Add stop method ([#3153](https://github.com/karma-runner/karma/issues/3153)) ([6d96d8e](https://github.com/karma-runner/karma/commit/6d96d8e)), closes [#3149](https://github.com/karma-runner/karma/issues/3149)
* **server:** Add support for encoded source files ([#3123](https://github.com/karma-runner/karma/issues/3123)) ([68b37d3](https://github.com/karma-runner/karma/commit/68b37d3))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/karma-runner/karma/compare/v2.0.5...v3.0.0) (2018-08-09)


### Bug Fixes

* **config:** wait 20s for browser activity. ([#3087](https://github.com/karma-runner/karma/issues/3087)) ([88b977f](https://github.com/karma-runner/karma/commit/88b977f))
* **config:** Wait 30s for browser activity per Travis. ([#3091](https://github.com/karma-runner/karma/issues/3091)) ([f6d2f0e](https://github.com/karma-runner/karma/commit/f6d2f0e))
* **init:** add "ChromeHeadless" to the browsers' options ([#3096](https://github.com/karma-runner/karma/issues/3096)) ([56fda53](https://github.com/karma-runner/karma/commit/56fda53))
* **server:** Exit clean on unhandledRejections. ([#3092](https://github.com/karma-runner/karma/issues/3092)) ([02f54c6](https://github.com/karma-runner/karma/commit/02f54c6)), closes [#3064](https://github.com/karma-runner/karma/issues/3064)
* **travis:** Up the socket timeout 2->20s. ([#3103](https://github.com/karma-runner/karma/issues/3103)) ([732396a](https://github.com/karma-runner/karma/commit/732396a)), closes [#3102](https://github.com/karma-runner/karma/issues/3102)
* **travis:** use the value not the key name. ([#3097](https://github.com/karma-runner/karma/issues/3097)) ([90f5546](https://github.com/karma-runner/karma/commit/90f5546))
* **travis:** validate TRAVIS_COMMIT if TRAVIS_PULL_REQUEST_SHA is not set. ([#3094](https://github.com/karma-runner/karma/issues/3094)) ([fba5d36](https://github.com/karma-runner/karma/commit/fba5d36))
* **travis:** Validate TRAVIS_PULL_REQUEST_SHA rather than TRAVIS_COMMIT. ([#3093](https://github.com/karma-runner/karma/issues/3093)) ([a58fa45](https://github.com/karma-runner/karma/commit/a58fa45))

### BREAKING CHANGES

* Drop Support for Nodejs4 ([#3082](https://github.com/karma-runner/karma/pull/3082))



<a name="2.0.5"></a>
## [2.0.5](https://github.com/karma-runner/karma/compare/v2.0.4...v2.0.5) (2018-07-24)


### Bug Fixes

* remove circular reference in Browser ([518cb11](https://github.com/karma-runner/karma/commit/518cb11)), closes [#3075](https://github.com/karma-runner/karma/issues/3075)
* **browser:** ensure browser state is EXECUTING when tests start ([#3074](https://github.com/karma-runner/karma/issues/3074)) ([dc7265b](https://github.com/karma-runner/karma/commit/dc7265b)), closes [#1640](https://github.com/karma-runner/karma/issues/1640)
* **doc:** Document release steps for admins ([#3063](https://github.com/karma-runner/karma/issues/3063)) ([a701732](https://github.com/karma-runner/karma/commit/a701732))
* **middleware:** Obey the Promise API. ([93ba05a](https://github.com/karma-runner/karma/commit/93ba05a))
* **server:** pass bound port to prevent`EADDRINUSE` issue. ([#3065](https://github.com/karma-runner/karma/issues/3065)) ([850a90b](https://github.com/karma-runner/karma/commit/850a90b))


### Features

* **preprocessor:** Allow preprocessor to handle binary files ([#3054](https://github.com/karma-runner/karma/issues/3054)) ([7b66e18](https://github.com/karma-runner/karma/commit/7b66e18))



<a name="2.0.4"></a>
## [2.0.4](https://github.com/karma-runner/karma/compare/v2.0.3...v2.0.4) (2018-06-21)


### Bug Fixes

* **deps:** remove babel-core and babel call in wallaby. ([#3044](https://github.com/karma-runner/karma/issues/3044)) ([7da8ca0](https://github.com/karma-runner/karma/commit/7da8ca0))
* **events:** bind emitters with for..in. ([#3059](https://github.com/karma-runner/karma/issues/3059)) ([b99f03f](https://github.com/karma-runner/karma/commit/b99f03f)), closes [#3057](https://github.com/karma-runner/karma/issues/3057)
* **launcher:** Only markCaptured browsers that are launched. ([#3047](https://github.com/karma-runner/karma/issues/3047)) ([f8f3ebc](https://github.com/karma-runner/karma/commit/f8f3ebc))
* **server:** actually call stert(). ([#3062](https://github.com/karma-runner/karma/issues/3062)) ([40d836a](https://github.com/karma-runner/karma/commit/40d836a))
* **server:** Resurrect static function Server.start() lost in 2.0.3 ([#3055](https://github.com/karma-runner/karma/issues/3055)) ([c88ebc6](https://github.com/karma-runner/karma/commit/c88ebc6))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/karma-runner/karma/compare/v2.0.2...v2.0.3) (2018-06-15)


The 2.03. change log was incorrectly created due to an extra pending tag in the repo.

<a name="2.0.2"></a>
## [2.0.2](https://github.com/karma-runner/karma/compare/v2.0.1...v2.0.2) (2018-04-19)


### Bug Fixes

* **package.json:** sinon-chai 2.13 is not compatible with sinon 4.x ([#2977](https://github.com/karma-runner/karma/issues/2977)) ([e095b05](https://github.com/karma-runner/karma/commit/e095b05))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/karma-runner/karma/compare/v1.7.1...v2.0.1) (2018-04-19)


### Bug Fixes

* **browser:** nicer "disconnect" - no more "Disconnectedundefined" ([a987d63](https://github.com/karma-runner/karma/commit/a987d63))
* **common:** fix AppVeyor build ([6c5e7d0](https://github.com/karma-runner/karma/commit/6c5e7d0))
* **common:** more detailed info about error ([424aacc](https://github.com/karma-runner/karma/commit/424aacc))
* **config:** Call debug log methods after setting the loglevel based upon config/cli-options. ([a340dae](https://github.com/karma-runner/karma/commit/a340dae))
* **config:** Call debug log methods after setting the loglevel based upon config/cli-options. ([99fd3f0](https://github.com/karma-runner/karma/commit/99fd3f0))
* **config:** Retry install with appveyor-retry.   ([17d5791](https://github.com/karma-runner/karma/commit/17d5791))
* **config:** Workaround npm 5.4 windows bug ([ec47d81](https://github.com/karma-runner/karma/commit/ec47d81))
* **deps:** update socket.io to version 2.0.3. ([3b7b019](https://github.com/karma-runner/karma/commit/3b7b019)), closes [#2777](https://github.com/karma-runner/karma/issues/2777)
* **logging:** Upgrade to log4js 2.x API. ([#2868](https://github.com/karma-runner/karma/issues/2868)) ([f6f8707](https://github.com/karma-runner/karma/commit/f6f8707)), closes [#2858](https://github.com/karma-runner/karma/issues/2858)
* **middleware:** add file type to absolute urls  ([bd1f799](https://github.com/karma-runner/karma/commit/bd1f799))
* ignore jsVersion configuration property in Firefox 59+  ([2694d54](https://github.com/karma-runner/karma/commit/2694d54)), closes [#2957](https://github.com/karma-runner/karma/issues/2957)
* **middleware:** avoid using deprecated Buffer API ([018e6be](https://github.com/karma-runner/karma/commit/018e6be))
* **reporter:** Fix issue causing error stack not to be parsed correctly ([ac4e1a9](https://github.com/karma-runner/karma/commit/ac4e1a9)), closes [#2930](https://github.com/karma-runner/karma/issues/2930)
* **reporter:** show file path correctly when urlRoot specified ([34dc7d3](https://github.com/karma-runner/karma/commit/34dc7d3)), closes [#2897](https://github.com/karma-runner/karma/issues/2897)
* **server:** switch to sync write ([6ec74ee](https://github.com/karma-runner/karma/commit/6ec74ee))


### Features

* **cli:** Warn on commands with underscores. ([0801a7f](https://github.com/karma-runner/karma/commit/0801a7f))
* **config:** allow to use newer versions of CoffeeScript ([c1fcf42](https://github.com/karma-runner/karma/commit/c1fcf42))
* **launcher:** trim whitespace in browser name ([871d46f](https://github.com/karma-runner/karma/commit/871d46f))
* **launcher:** trim whitespace in browser name ([334f9fb](https://github.com/karma-runner/karma/commit/334f9fb))
* **middleware:** added manual file type option ([0330cd1](https://github.com/karma-runner/karma/commit/0330cd1)), closes [#2824](https://github.com/karma-runner/karma/issues/2824)
* better string representation of errors ([c9e1ca9](https://github.com/karma-runner/karma/commit/c9e1ca9))
* drop core-js and babel where possible ([60dfc5c](https://github.com/karma-runner/karma/commit/60dfc5c))
* update of supported node versions ([e79463b](https://github.com/karma-runner/karma/commit/e79463b))



<a name="1.7.1"></a>
## [1.7.1](https://github.com/karma-runner/karma/compare/v1.7.0...1.7.1) (2017-08-25)


### Bug Fixes

* **debug-runner:** support asynchronous tests in the debug runner ([a36f3eb](https://github.com/karma-runner/karma/commit/a36f3eb)), closes [#2811](https://github.com/karma-runner/karma/issues/2811)
* **file-list:** Stop polluting global environment with core-js ([0988022](https://github.com/karma-runner/karma/commit/0988022))
* **preprocessor:** renamed handeFile to readFileCallback ([92a8c81](https://github.com/karma-runner/karma/commit/92a8c81))
* **preprocessor:** retry if fs.readFile fails ([4b60513](https://github.com/karma-runner/karma/commit/4b60513))
* **preprocessor:** throw if retry fails ([2789bf5](https://github.com/karma-runner/karma/commit/2789bf5))


### Features

* **ci:** disable testing of node versions below 4 ([ec92ea9](https://github.com/karma-runner/karma/commit/ec92ea9))
* **client:** log global error stack trace  ([523d608](https://github.com/karma-runner/karma/commit/523d608)), closes [#2812](https://github.com/karma-runner/karma/issues/2812)
* **config:** remove polling usage ([b0f41c7](https://github.com/karma-runner/karma/commit/b0f41c7)), closes [#2669](https://github.com/karma-runner/karma/issues/2669)
* **deps:** add support for node[@8](https://github.com/8) ([7feaee3](https://github.com/karma-runner/karma/commit/7feaee3)), closes [#2754](https://github.com/karma-runner/karma/issues/2754)
* **deps:** update socket.io to `1.7.4` to avoid issue with `ws[@1](https://github.com/1).1.2` ([264442b](https://github.com/karma-runner/karma/commit/264442b)), closes [#2593](https://github.com/karma-runner/karma/issues/2593)
* **watcher:** Debounce autoWatchBatchDelay ([2f8c049](https://github.com/karma-runner/karma/commit/2f8c049)), closes [#2331](https://github.com/karma-runner/karma/issues/2331)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/karma-runner/karma/compare/v1.7.1...v2.0.0) (2017-12-21)


### Bug Fixes

* **config:** Call debug log methods after setting the loglevel based upon config/cli-options. ([99fd3f0](https://github.com/karma-runner/karma/commit/99fd3f0))
* **config:** Call debug log methods after setting the loglevel based upon config/cli-options. ([a340dae](https://github.com/karma-runner/karma/commit/a340dae))
* **config:** Retry install with appveyor-retry.   ([17d5791](https://github.com/karma-runner/karma/commit/17d5791))
* **config:** Workaround npm 5.4 windows bug ([ec47d81](https://github.com/karma-runner/karma/commit/ec47d81))
* **deps:** update socket.io to version 2.0.3. ([3b7b019](https://github.com/karma-runner/karma/commit/3b7b019)), closes [#2821](https://github.com/karma-runner/karma/issues/2821) [#2777](https://github.com/karma-runner/karma/issues/2777)
* **logging:** Upgrade to log4js 2.x API. ([#2868](https://github.com/karma-runner/karma/issues/2868)) ([f6f8707](https://github.com/karma-runner/karma/commit/f6f8707)), closes [#2858](https://github.com/karma-runner/karma/issues/2858)
* **reporter:** show file path correctly when urlRoot specified ([34dc7d3](https://github.com/karma-runner/karma/commit/34dc7d3)), closes [#2897](https://github.com/karma-runner/karma/issues/2897)
* **debug-runner:** support asynchronous tests in the debug runner ([a36f3eb](https://github.com/karma-runner/karma/commit/a36f3eb)), closes [#2811](https://github.com/karma-runner/karma/issues/2811)
* **file-list:** Stop polluting global environment with core-js ([0988022](https://github.com/karma-runner/karma/commit/0988022))
* **preprocessor:** renamed handeFile to readFileCallback ([92a8c81](https://github.com/karma-runner/karma/commit/92a8c81))
* **preprocessor:** retry if fs.readFile fails ([4b60513](https://github.com/karma-runner/karma/commit/4b60513))
* **preprocessor:** throw if retry fails ([2789bf5](https://github.com/karma-runner/karma/commit/2789bf5))


### Features

* **cli:** Warn on commands with underscores. ([0801a7f](https://github.com/karma-runner/karma/commit/0801a7f))
* **config:** allow to use newer versions of CoffeeScript ([c1fcf42](https://github.com/karma-runner/karma/commit/c1fcf42))
* **launcher:** trim whitespace in browser name ([871d46f](https://github.com/karma-runner/karma/commit/871d46f))
* **launcher:** trim whitespace in browser name ([334f9fb](https://github.com/karma-runner/karma/commit/334f9fb))
* **middleware:** added manual file type option ([0330cd1](https://github.com/karma-runner/karma/commit/0330cd1)), closes [#2824](https://github.com/karma-runner/karma/issues/2824)
* better string representation of errors ([c9e1ca9](https://github.com/karma-runner/karma/commit/c9e1ca9))
n* drop core-js and babel where possible ([60dfc5c](https://github.com/karma-runner/karma/commit/60dfc5c))
* update of supported node versions ([e79463b](https://github.com/karma-runner/karma/commit/e79463b))
* **ci:** disable testing of node versions below 4 ([ec92ea9](https://github.com/karma-runner/karma/commit/ec92ea9))
* **client:** log global error stack trace  ([523d608](https://github.com/karma-runner/karma/commit/523d608)), closes [#2812](https://github.com/karma-runner/karma/issues/2812)
* **config:** remove polling usage ([b0f41c7](https://github.com/karma-runner/karma/commit/b0f41c7)), closes [#2669](https://github.com/karma-runner/karma/issues/2669)
* **deps:** add support for node@8 ([7feaee3](https://github.com/karma-runner/karma/commit/7feaee3)), closes [#2754](https://github.com/karma-runner/karma/issues/2754)
* **deps:** update socket.io to `1.7.4` to avoid issue with `ws@1.1.2` ([264442b](https://github.com/karma-runner/karma/commit/264442b)), closes [#2593](https://github.com/karma-runner/karma/issues/2593)
* **watcher:** Debounce autoWatchBatchDelay ([2f8c049](https://github.com/karma-runner/karma/commit/2f8c049)), closes [#2331](https://github.com/karma-runner/karma/issues/2331)



<a name="1.7.1"></a>
## [1.7.1](https://github.com/karma-runner/karma/compare/v1.7.0...v1.7.1) (2017-08-30)


### Features

* **deps:** add support for node[@8](https://github.com/8) ([ea32194](https://github.com/karma-runner/karma/commit/ea32194)), closes [#2754](https://github.com/karma-runner/karma/issues/2754)



<a name="1.7.0"></a>
# [1.7.0](https://github.com/karma-runner/karma/compare/v1.6.0...v1.7.0) (2017-05-06)


### Bug Fixes

* **middleware:** change to use vanilla for loop ([ac62cc0](https://github.com/karma-runner/karma/commit/ac62cc0)), closes [#2671](https://github.com/karma-runner/karma/issues/2671)
* **reporters:** Revert the backwards-incompatible log priority order changes ([316b944](https://github.com/karma-runner/karma/commit/316b944)), closes [#2582](https://github.com/karma-runner/karma/issues/2582)


### Features

* **runner:** Buffer stdout and stderr for output when errors occur ([460d423](https://github.com/karma-runner/karma/commit/460d423))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/karma-runner/karma/compare/v1.5.0...v1.6.0) (2017-04-05)


### Bug Fixes

* **client:** add proxy support to stringify ([be10116](https://github.com/karma-runner/karma/commit/be10116))
* **file-list:** always use file from first matcher ([74bfdf3](https://github.com/karma-runner/karma/commit/74bfdf3))
* **middleware:** does not work with mootools ([#2591](https://github.com/karma-runner/karma/issues/2591)) ([2685e13](https://github.com/karma-runner/karma/commit/2685e13))
* **reporter:** keep users exact formatError result ([17c2c43](https://github.com/karma-runner/karma/commit/17c2c43))


### Features

* **browser:** add browser_info event ([09ac7d7](https://github.com/karma-runner/karma/commit/09ac7d7)), closes [#2192](https://github.com/karma-runner/karma/issues/2192)
* **launcher:** output stderr for failing launchers ([7d33398](https://github.com/karma-runner/karma/commit/7d33398))
* **proxy:** add proxy events to config  ([f5d99fb](https://github.com/karma-runner/karma/commit/f5d99fb))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/karma-runner/karma/compare/v1.4.1...v1.5.0) (2017-02-20)


### Bug Fixes

* filter browser logging by level of LOG ([89a7a1c](https://github.com/karma-runner/karma/commit/89a7a1c)), closes [#2228](https://github.com/karma-runner/karma/issues/2228)
* make window.parent.karma available in debugged context ([3e7eaeb](https://github.com/karma-runner/karma/commit/3e7eaeb))
* **client:** don't crash if receive array-like results ([e095411](https://github.com/karma-runner/karma/commit/e095411)), closes [#2061](https://github.com/karma-runner/karma/issues/2061)


### Features

* add an option to run the tests by dynamically loading test scripts without iframe ([aa42c41](https://github.com/karma-runner/karma/commit/aa42c41))
* add support for node[@7](https://github.com/7) ([eb407ab](https://github.com/karma-runner/karma/commit/eb407ab)), closes [#2559](https://github.com/karma-runner/karma/issues/2559)



<a name="1.4.1"></a>
## [1.4.1](https://github.com/karma-runner/karma/compare/v1.4.0...v1.4.1) (2017-01-29)


### Bug Fixes

* **runner:** Make process kill timeout configurable ([ffaa054](https://github.com/karma-runner/karma/commit/ffaa054)), closes [#2447](https://github.com/karma-runner/karma/issues/2447)
* **runner:** Make process kill timeout configurable - Fix Build ([a128e5c](https://github.com/karma-runner/karma/commit/a128e5c)), closes [#2447](https://github.com/karma-runner/karma/issues/2447)
* **runner:** Test process kill timeout config ([99a1d48](https://github.com/karma-runner/karma/commit/99a1d48)), closes [#2447](https://github.com/karma-runner/karma/issues/2447)


### Features

* **config:** allow config to be a default export ([9976dce](https://github.com/karma-runner/karma/commit/9976dce))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/karma-runner/karma/compare/v1.3.0...v1.4.0) (2017-01-14)


### Bug Fixes

* **browser:** filter browser logging by level  ([35965d9](https://github.com/karma-runner/karma/commit/35965d9)), closes [#2228](https://github.com/karma-runner/karma/issues/2228)
* **cli:** restore shell completion in the npm package ([f56b5a5](https://github.com/karma-runner/karma/commit/f56b5a5)), closes [#2351](https://github.com/karma-runner/karma/issues/2351)
* **config:** add crossOriginAttribute config option ([1e465b1](https://github.com/karma-runner/karma/commit/1e465b1))
* **middleware:** update `Buffer` usage ([3d94b8c](https://github.com/karma-runner/karma/commit/3d94b8c))
* **reporter:** do not allow URL domains to span new lines ([2c13404](https://github.com/karma-runner/karma/commit/2c13404))
* **reporter:** strip only hostname/port ([fbbeccf](https://github.com/karma-runner/karma/commit/fbbeccf)), closes [#2209](https://github.com/karma-runner/karma/issues/2209)
* **reporters:**  cannot read property map of undefined  ([305df2c](https://github.com/karma-runner/karma/commit/305df2c)), closes [#1662](https://github.com/karma-runner/karma/issues/1662)
* **server:** exit with code 1 when failing due to missing browser ([86e2ef2](https://github.com/karma-runner/karma/commit/86e2ef2)), closes [#2403](https://github.com/karma-runner/karma/issues/2403)


### Features

* **api:** add constants to the public api ([ee10977](https://github.com/karma-runner/karma/commit/ee10977)), closes [#2361](https://github.com/karma-runner/karma/issues/2361)
* **api:** expose `config.parseConfig` on the public api ([7d2c1ae](https://github.com/karma-runner/karma/commit/7d2c1ae))
* **client:** capture confirm & prompt  ([3a618b3](https://github.com/karma-runner/karma/commit/3a618b3)), closes [#694](https://github.com/karma-runner/karma/issues/694)
* **server:** add listen address option so that IPv6 and loopback interfaces can be used ([8e5bee6](https://github.com/karma-runner/karma/commit/8e5bee6)), closes [#2477](https://github.com/karma-runner/karma/issues/2477)
* **web-server:** allow overriding of default http module ([1e7514d](https://github.com/karma-runner/karma/commit/1e7514d)), closes [#2424](https://github.com/karma-runner/karma/issues/2424)



<a name="1.3.0"></a>
# [1.3.0](https://github.com/karma-runner/karma/compare/v1.2.0...v1.3.0) (2016-09-09)


### Bug Fixes

* **launcher:** exclude concurrent browser on launcher restart ([96f8f14](https://github.com/karma-runner/karma/commit/96f8f14)), closes [#2280](https://github.com/karma-runner/karma/issues/2280)
* **middleware:** ensure Range headers adhere more closely to RFC 2616 ([8b1b4b1](https://github.com/karma-runner/karma/commit/8b1b4b1)), closes [#2310](https://github.com/karma-runner/karma/issues/2310)


### Features

* **reporter:** add config formatError function  ([98a4fbf](https://github.com/karma-runner/karma/commit/98a4fbf)), closes [#2119](https://github.com/karma-runner/karma/issues/2119)
* upstreamProxy config option to deal with proxies that adjust the base path, etc ([55755e4](https://github.com/karma-runner/karma/commit/55755e4))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/karma-runner/karma/compare/v1.1.1...v1.2.0) (2016-08-11)


### Bug Fixes

* **context:** Updated postMessage listener to stop validating non-Karma messages ([306e565](https://github.com/karma-runner/karma/commit/306e565))
* **docs:** fix stopper.stop wrong variable name. closes [#2244](https://github.com/karma-runner/karma/issues/2244) ([0745a00](https://github.com/karma-runner/karma/commit/0745a00)), closes [#2244](https://github.com/karma-runner/karma/issues/2244)
* **file-list:** ensure patterns are comparable ([4d1bf3e](https://github.com/karma-runner/karma/commit/4d1bf3e)), closes [#2194](https://github.com/karma-runner/karma/issues/2194)
* **middleware:** fix WARN log when passing undefined error handler to promise.then ([20b87de](https://github.com/karma-runner/karma/commit/20b87de)), closes [#2227](https://github.com/karma-runner/karma/issues/2227)
* call .resume to prevent browser output streams filling up ([107cd02](https://github.com/karma-runner/karma/commit/107cd02))
* Merge config child nodes on config.set() ([65b688a](https://github.com/karma-runner/karma/commit/65b688a))
* **web-server:** Allow karma to run in project which path contains HTML URL encoded characters. Karma fails on Jenkins when it checks out branches containing '/' as it converts it to '%2F'. Fixes  errors seen on [#1751](https://github.com/karma-runner/karma/issues/1751), [#61](https://github.com/karma-runner/karma/issues/61). ([da1930f](https://github.com/karma-runner/karma/commit/da1930f)), closes [#1751](https://github.com/karma-runner/karma/issues/1751) [#61](https://github.com/karma-runner/karma/issues/61)


### Features

* **web-server:** Allow Range headers in web server. ([a567b6f](https://github.com/karma-runner/karma/commit/a567b6f)), closes [#2140](https://github.com/karma-runner/karma/issues/2140)



<a name="1.1.2"></a>
## [1.1.2](https://github.com/karma-runner/karma/compare/v1.1.1...v1.1.2) (2016-07-26)


### Bug Fixes

* Merge config child nodes on config.set() ([65b688a](https://github.com/karma-runner/karma/commit/65b688a))
* **context:** Updated postMessage listener to stop validating non-Karma messages ([306e565](https://github.com/karma-runner/karma/commit/306e565))
* **docs:** fix stopper.stop wrong variable name. closes [#2244](https://github.com/karma-runner/karma/issues/2244) ([0745a00](https://github.com/karma-runner/karma/commit/0745a00)), closes [#2244](https://github.com/karma-runner/karma/issues/2244)
* **file-list:** ensure patterns are comparable ([4d1bf3e](https://github.com/karma-runner/karma/commit/4d1bf3e)), closes [#2194](https://github.com/karma-runner/karma/issues/2194)
* **middleware:** fix WARN log when passing undefined error handler to promise.then ([20b87de](https://github.com/karma-runner/karma/commit/20b87de)), closes [#2227](https://github.com/karma-runner/karma/issues/2227)



<a name="1.1.1"></a>
## [1.1.1](https://github.com/karma-runner/karma/compare/v1.1.0...v1.1.1) (2016-07-07)


### Bug Fixes

* **executor:** ensure run_complete is emitted last ([9c894f9](https://github.com/karma-runner/karma/commit/9c894f9)), closes [#2210](https://github.com/karma-runner/karma/issues/2210)
* **reporter:** inject correct config option ([80bd726](https://github.com/karma-runner/karma/commit/80bd726))
* **reporter:** remove console.log ([b4e3694](https://github.com/karma-runner/karma/commit/b4e3694))
* Add crossorigin attribute to script HTML tags ([5690ffe](https://github.com/karma-runner/karma/commit/5690ffe))


### Features

* deprecate helper._ ([5c6b151](https://github.com/karma-runner/karma/commit/5c6b151))
* **config:** add support for TypeScript ([6445310](https://github.com/karma-runner/karma/commit/6445310))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/karma-runner/karma/compare/v1.0.0...v1.1.0) (2016-06-26)


### Bug Fixes

* **deps:** freeze socket.io version ([73e300d](https://github.com/karma-runner/karma/commit/73e300d))
* **server:** log browser messages to the terminal ([d1f924c](https://github.com/karma-runner/karma/commit/d1f924c)), closes [#2187](https://github.com/karma-runner/karma/issues/2187)


### Features

* Allow frameworks to inject middleware ([d972f3d](https://github.com/karma-runner/karma/commit/d972f3d))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/karma-runner/karma/compare/v0.13.22...v1.0.0) (2016-06-23)


### Bug Fixes

* **ci:** Repaired AppVeyor for Node.js[@0](https://github.com/0).12 ([cbfd98c](https://github.com/karma-runner/karma/commit/cbfd98c))
* **client:** does not throws an error for non DOM object that has `tagName` property ([ba55afb](https://github.com/karma-runner/karma/commit/ba55afb)), closes [#2139](https://github.com/karma-runner/karma/issues/2139)
* **files:** Ignore included:false pattern ([db42a7f](https://github.com/karma-runner/karma/commit/db42a7f)), closes [#1530](https://github.com/karma-runner/karma/issues/1530)
* **helper:** Patched replaceWinPath from choking on `null` values ([caa4d21](https://github.com/karma-runner/karma/commit/caa4d21))
* **karma:** Escape quotes for file names. This fixes issue [#1876](https://github.com/karma-runner/karma/issues/1876). ([9dff3f3](https://github.com/karma-runner/karma/commit/9dff3f3)), closes [#1876](https://github.com/karma-runner/karma/issues/1876) [#1876](https://github.com/karma-runner/karma/issues/1876)
* **launcher:** Allow dynamic browser launches ([2b7d703](https://github.com/karma-runner/karma/commit/2b7d703))
* **launcher:** send sigkill on timeout when force killing ([c615c1f](https://github.com/karma-runner/karma/commit/c615c1f))
* **proxy:** Port mixup and infinite loop ([05616a2](https://github.com/karma-runner/karma/commit/05616a2)), closes [#1987](https://github.com/karma-runner/karma/issues/1987)
* **reporter:** Better handling of non string error ([82f1c12](https://github.com/karma-runner/karma/commit/82f1c12))
* **reporter:** Disable source maps for URLs without line number ([2080221](https://github.com/karma-runner/karma/commit/2080221)), closes [#1274](https://github.com/karma-runner/karma/issues/1274)
* Change timing on test ([0cb6204](https://github.com/karma-runner/karma/commit/0cb6204))
* Setting default value for config in runner and stopper ([414db89](https://github.com/karma-runner/karma/commit/414db89))
* **reporters:** Fix results not being reported ([6303566](https://github.com/karma-runner/karma/commit/6303566))
* **reporters:** Throwing error without loosing stack trace ([8a515ae](https://github.com/karma-runner/karma/commit/8a515ae))
* **runner:** Merge config.client.args with client.args provided by run ([91de383](https://github.com/karma-runner/karma/commit/91de383)), closes [#1746](https://github.com/karma-runner/karma/issues/1746)
* **updater:** Fix time unit on screen display from 'ms' to 'seconds'. ([f39dd04](https://github.com/karma-runner/karma/commit/f39dd04))
* **web-server:** Restart disconnected browser in non-singleRun mode. ([f6587dc](https://github.com/karma-runner/karma/commit/f6587dc))
* **web-server:** Update config on every request ([8ef475f](https://github.com/karma-runner/karma/commit/8ef475f)), closes [#1972](https://github.com/karma-runner/karma/issues/1972)


### Code Refactoring

* **context:** Future-proofed context.html and debug.html for modularity ([43f6a1a](https://github.com/karma-runner/karma/commit/43f6a1a))


### Features

* **browser:** Emit a browser error when a disconnect occurs. ([e36ba6c](https://github.com/karma-runner/karma/commit/e36ba6c))
* **config:** Add configuration for adding javascript version. ([0239c75](https://github.com/karma-runner/karma/commit/0239c75)), closes [#1719](https://github.com/karma-runner/karma/issues/1719)
* **config:** Allow custom context and debug files, with feature test and some specs. ([225c0e5](https://github.com/karma-runner/karma/commit/225c0e5))
* **file-list:** Upgrade bluebird to v.3 ([f5c252f](https://github.com/karma-runner/karma/commit/f5c252f))
* **logging:** Add colors and log-level options to run-command ([9d4e234](https://github.com/karma-runner/karma/commit/9d4e234))
* **logging:** Add logging-setup function ([d14bd62](https://github.com/karma-runner/karma/commit/d14bd62))
* **logging:** Send color option to server ([287d0db](https://github.com/karma-runner/karma/commit/287d0db))
* **preprocessors:** if a file matches multiple preprocessor patterns, intelligently merge the list of preprocessors, deduping and trying to preserve the order ([59642a6](https://github.com/karma-runner/karma/commit/59642a6))
* **reporter:** improve source map handling and reporting. ([cf0be47](https://github.com/karma-runner/karma/commit/cf0be47))
* **reporters:** Look for color-reporter ([fd9262d](https://github.com/karma-runner/karma/commit/fd9262d))
* **server:** add 'listening' event with port number ([82cd0df](https://github.com/karma-runner/karma/commit/82cd0df))
* Add `stopper` to the public API ([3d4fa00](https://github.com/karma-runner/karma/commit/3d4fa00))
* Add possibility to stop a karma server ([66ae80b](https://github.com/karma-runner/karma/commit/66ae80b))
* add support for node 6 ([0b8dc2c](https://github.com/karma-runner/karma/commit/0b8dc2c))
* adding support for before middleware ([51b4206](https://github.com/karma-runner/karma/commit/51b4206))
* **stopper:** Enable programically detached server ([f10fd81](https://github.com/karma-runner/karma/commit/f10fd81))
* Fail on launcher-, reporter-, plugin-, or preprocessor-load errors. ([fca930e](https://github.com/karma-runner/karma/commit/fca930e)), closes [#855](https://github.com/karma-runner/karma/issues/855)
* upgrade dependencies to their latest versions ([08242a0](https://github.com/karma-runner/karma/commit/08242a0))


### BREAKING CHANGES

* context: Our `context.html` and `debug.html` structures have changed to lean on `context.js` and `debug.js`.
This is in preparation for deeper `context.js` changes in #1984.

As a result, all `customContextFile` and `customDebugFile` options much update their format
to match this new format.



<a name="0.13.22"></a>
## [0.13.22](https://github.com/karma-runner/karma/compare/v0.13.21...v0.13.22) (2016-03-08)




<a name="0.13.21"></a>
## [0.13.21](https://github.com/karma-runner/karma/compare/v0.13.20...v0.13.21) (2016-02-12)


### Reverts

* "Merge pull request #1791 from budde377/feature-adding-no-colors-to-run-command" ([96ebdc4](https://github.com/karma-runner/karma/commit/96ebdc4)), closes [#1894](https://github.com/karma-runner/karma/issues/1894) [#1895](https://github.com/karma-runner/karma/issues/1895)



<a name="0.13.20"></a>
## [0.13.20](https://github.com/karma-runner/karma/compare/v0.13.19...v0.13.20) (2016-02-12)


### Bug Fixes

* **runner:** Remove null characters from terminal output ([3481500](https://github.com/karma-runner/karma/commit/3481500)), closes [#1343](https://github.com/karma-runner/karma/issues/1343)
* invalid characters in the headers on Node 5.6.0 ([152337d](https://github.com/karma-runner/karma/commit/152337d))
* Remove inadvertently added dependency to mock-fs ([ad5f6b5](https://github.com/karma-runner/karma/commit/ad5f6b5))
* Switch all requires from fs to graceful-fs ([1e21aaa](https://github.com/karma-runner/karma/commit/1e21aaa))
* Upgrade socket.io to 1.4.5 ([2f51a9f](https://github.com/karma-runner/karma/commit/2f51a9f))

### Features

* Allow custom browser names ([60ba85f](https://github.com/karma-runner/karma/commit/60ba85f))
* Do not fail on empty test suite ([8004763](https://github.com/karma-runner/karma/commit/8004763)), closes [#926](https://github.com/karma-runner/karma/issues/926)
* **config:** Add `forceJSONP` option ([8627d67](https://github.com/karma-runner/karma/commit/8627d67))
* **launcher:** Enable specification of retry-limit ([cc5547c](https://github.com/karma-runner/karma/commit/cc5547c)), closes [#1126](https://github.com/karma-runner/karma/issues/1126)
* **logging:** Add colors and log-level options to run-command ([2d29165](https://github.com/karma-runner/karma/commit/2d29165))
* **logging:** Send color option to server ([486c4f3](https://github.com/karma-runner/karma/commit/486c4f3))
* **web-server:** Use isbinaryfile for binary file detection ([f938a8e](https://github.com/karma-runner/karma/commit/f938a8e)), closes [#1070](https://github.com/karma-runner/karma/issues/1070)



<a name="0.13.19"></a>
## [0.13.19](https://github.com/karma-runner/karma/compare/v0.13.18...v0.13.19) (2016-01-06)


### Bug Fixes

* **server:** Handle new socket.io internal format. ([3ab78d6](https://github.com/karma-runner/karma/commit/3ab78d6)), closes [#1782](https://github.com/karma-runner/karma/issues/1782)



<a name="0.13.18"></a>
## [0.13.18](https://github.com/karma-runner/karma/compare/v0.13.17...v0.13.18) (2016-01-05)


### Bug Fixes

* **preprocessor:** Improve handling of failed preprocessors ([e726d1c](https://github.com/karma-runner/karma/commit/e726d1c)), closes [#1521](https://github.com/karma-runner/karma/issues/1521)

### Features

* **cli:** Add .config/karma.conf.js to the default lookup path ([49bf1aa](https://github.com/karma-runner/karma/commit/49bf1aa)), closes [#1387](https://github.com/karma-runner/karma/issues/1387)
* **config:** Add a clearContext config to prevent clearing of context. ([5fc8ee7](https://github.com/karma-runner/karma/commit/5fc8ee7))
* **config:** mime config option support ([d562383](https://github.com/karma-runner/karma/commit/d562383)), closes [#1735](https://github.com/karma-runner/karma/issues/1735)



<a name="0.13.17"></a>
## [0.13.17](https://github.com/karma-runner/karma/compare/v0.13.16...v0.13.17) (2016-01-04)




<a name="0.13.16"></a>
## [0.13.16](https://github.com/karma-runner/karma/compare/v0.13.15...v0.13.16) (2015-12-24)


### Bug Fixes

* **config:** corrects spelling in example config template ([9fafc60](https://github.com/karma-runner/karma/commit/9fafc60))
* **middleware:** Correct spelling of middleware logger name ([9e9e7e6](https://github.com/karma-runner/karma/commit/9e9e7e6))
* **preprocessor:** Directory names with dots ([4b5e094](https://github.com/karma-runner/karma/commit/4b5e094))
* **test:** locale in Expire header ([db04cf0](https://github.com/karma-runner/karma/commit/db04cf0)), closes [#1741](https://github.com/karma-runner/karma/issues/1741)

### Features

* **proxy:** Allow proxies configuration to be an object ([ad94356](https://github.com/karma-runner/karma/commit/ad94356))
* **proxy:** Allow to configure changeOrigin option of http-proxy ([ae05ea4](https://github.com/karma-runner/karma/commit/ae05ea4)), closes [#1729](https://github.com/karma-runner/karma/issues/1729)



<a name="0.13.15"></a>
## [0.13.15](https://github.com/karma-runner/karma/compare/v0.13.14...v0.13.15) (2015-11-03)


### Bug Fixes

* **eslint:** Fix formatting for the new ESLint 1.8.0 ([dc1bbab](https://github.com/karma-runner/karma/commit/dc1bbab))



<a name="0.13.14"></a>
## [0.13.14](https://github.com/karma-runner/karma/compare/v0.13.13...v0.13.14) (2015-10-22)


### Bug Fixes

* **client:** Revert back to old reloading detection ([f1c22d6](https://github.com/karma-runner/karma/commit/f1c22d6))
* **client:** Wait for childwindow to load ([c1bb15a](https://github.com/karma-runner/karma/commit/c1bb15a))



<a name="0.13.13"></a>
## [0.13.13](https://github.com/karma-runner/karma/compare/v0.13.12...v0.13.13) (2015-10-22)


### Bug Fixes

* **client:** Wait for iframe to be loaded ([1631474](https://github.com/karma-runner/karma/commit/1631474)), closes [#1652](https://github.com/karma-runner/karma/issues/1652)


<a name="0.13.12"></a>
## [0.13.12](https://github.com/karma-runner/karma/compare/v0.13.11...v0.13.12) (2015-10-22)


### Bug Fixes

* **proxy:** Pass protocol in target object to enable https requests ([142db90](https://github.com/karma-runner/karma/commit/142db90))

### Features

* **launcher:** Add concurrency limit ([1741deb](https://github.com/karma-runner/karma/commit/1741deb)), closes [#1465](https://github.com/karma-runner/karma/issues/1465)



<a name="0.13.11"></a>
## 0.13.11 (2015-10-14)


### Bug Fixes

* **reporter:** preserve base/absolute word in error ([b3798df](https://github.com/karma-runner/karma/commit/b3798df))

### Features

* **config:** add restartOnFileChange option ([1082f35](https://github.com/karma-runner/karma/commit/1082f35))
* **reporter:** Replace way-too-big memoizee with a trivial solution. ([d926fe3](https://github.com/karma-runner/karma/commit/d926fe3))
* **web-server:** add support for custom headers in files served ([4301bea](https://github.com/karma-runner/karma/commit/4301bea))
* **web-server:** allow injection of custom middleware. ([2e963c3](https://github.com/karma-runner/karma/commit/2e963c3)), closes [#1612](https://github.com/karma-runner/karma/issues/1612)



<a name="0.13.10"></a>
## 0.13.10 (2015-09-21)


### Bug Fixes

* **config:** Error when browers option isn't array ([b695460](https://github.com/karma-runner/karma/commit/b695460))

### Features

* **config:** Pass CLI arguments to `karma.config.js`. ([70cf903](https://github.com/karma-runner/karma/commit/70cf903)), closes [#1561](https://github.com/karma-runner/karma/issues/1561)



<a name="0.13.9"></a>
## 0.13.9 (2015-08-11)


### Bug Fixes

* **file-list:** refresh resolves before 'file_list_modified' event ([65f1eca](https://github.com/karma-runner/karma/commit/65f1eca)), closes [#1550](https://github.com/karma-runner/karma/issues/1550)
* **reporter:** Enable sourcemaps for errors that without column # ([086a542](https://github.com/karma-runner/karma/commit/086a542))



<a name="0.13.8"></a>
## 0.13.8 (2015-08-06)


### Bug Fixes

* **middleware:** Inject `config.urlRoot`. ([569ca0e](https://github.com/karma-runner/karma/commit/569ca0e)), closes [#1516](https://github.com/karma-runner/karma/issues/1516)

### Features

* **static:** Support media queries ([94e7b50](https://github.com/karma-runner/karma/commit/94e7b50))
* Add engine support for iojs@3. ([eb1c8d2](https://github.com/karma-runner/karma/commit/eb1c8d2))



<a name="0.13.7"></a>
## 0.13.7 (2015-08-05)


### Bug Fixes

* **file-list:** Use modified throttle instead of debounce ([cb2aafb](https://github.com/karma-runner/karma/commit/cb2aafb)), closes [#1545](https://github.com/karma-runner/karma/issues/1545)


<a name="0.13.6"></a>
## 0.13.6 (2015-08-05)


### Bug Fixes

* **client:** Use supported shim path. ([184f12e](https://github.com/karma-runner/karma/commit/184f12e))
* **web-server:** Ensure `filesPromise` is always resolvable ([892fa89](https://github.com/karma-runner/karma/commit/892fa89)), closes [#1544](https://github.com/karma-runner/karma/issues/1544)



<a name="0.13.5"></a>
## 0.13.5 (2015-08-04)


### Bug Fixes

* **file-list:** Ensure autowatchDelay is working. ([655599a](https://github.com/karma-runner/karma/commit/655599a)), closes [#1520](https://github.com/karma-runner/karma/issues/1520)
* **file-list:** use lodash find() ([3bd15a7](https://github.com/karma-runner/karma/commit/3bd15a7)), closes [#1533](https://github.com/karma-runner/karma/issues/1533)

### Features

* **web-server:** Allow running on https ([1696c78](https://github.com/karma-runner/karma/commit/1696c78))



<a name="0.13.4"></a>
## 0.13.4 (2015-08-04)


### Bug Fixes

* **client:** add ES5 shim ([14c30b7](https://github.com/karma-runner/karma/commit/14c30b7)), closes [#1529](https://github.com/karma-runner/karma/issues/1529)
* **reporter:** Ensure errors use the source map. ([0407a22](https://github.com/karma-runner/karma/commit/0407a22)), closes [#1495](https://github.com/karma-runner/karma/issues/1495)
* **runner:** Wait for file list refresh to finish before running ([94cddc0](https://github.com/karma-runner/karma/commit/94cddc0))
* **server:** Update timers for limited execution environments ([9cfc1cd](https://github.com/karma-runner/karma/commit/9cfc1cd)), closes [#1519](https://github.com/karma-runner/karma/issues/1519)



<a name="0.13.3"></a>
### 0.13.3 (2015-07-22)


#### Bug Fixes

* restore backward compatibility for karma@0.13 ([648b357a](https://github.com/karma-runner/karma/commit/648b357a))


#### Features

* **preprocessor:** Capital letters in binary files extenstions ([1688689d](https://github.com/karma-runner/karma/commit/1688689d), closes [#1508](https://github.com/karma-runner/karma/issues/1508))


<a name="0.13.2"></a>
### 0.13.2 (2015-07-17)


#### Features

* **cli:** Better CLI args validation ([73d31c2c](https://github.com/karma-runner/karma/commit/73d31c2c))
* **preprocessor:** Instantiate preprocessors early to avoid race conditions ([8a9c8c73](https://github.com/karma-runner/karma/commit/8a9c8c73))
* **server:** Add public api to force a file list refresh. ([b3c462a5](https://github.com/karma-runner/karma/commit/b3c462a5))


<a name="0.13.1"></a>
### 0.13.1 (2015-07-16)


#### Bug Fixes

* **file-list:**
  * Ensure files are sorted and unique ([9dc5f8bc](https://github.com/karma-runner/karma/commit/9dc5f8bc), closes [#1498](https://github.com/karma-runner/karma/issues/1498), [#1499](https://github.com/karma-runner/karma/issues/1499))
  * Normalize glob patterns ([fb841a79](https://github.com/karma-runner/karma/commit/fb841a79), closes [#1494](https://github.com/karma-runner/karma/issues/1494))


<a name="0.13.0"></a>
## 0.13.0 (2015-07-15)


#### Bug Fixes

* upgrade http-proxy module for bug fixes ([09c75fe1](https://github.com/karma-runner/karma/commit/09c75fe1))
* **cli:** print UserAgent string verbatim if from an unknown browser ([9d972263](https://github.com/karma-runner/karma/commit/9d972263))
* **client:**
  * serialise DOM objects ([1f73be4f](https://github.com/karma-runner/karma/commit/1f73be4f), closes [#1106](https://github.com/karma-runner/karma/issues/1106))
  * Update location detection for socket.io ([7a23fa57](https://github.com/karma-runner/karma/commit/7a23fa57))
* **deps:** Upgrade connect 3. ([b490985c](https://github.com/karma-runner/karma/commit/b490985c))
* **file-list:** Use correct find function ([4cfaae96](https://github.com/karma-runner/karma/commit/4cfaae96))
* **helper:** Ensure browser detection is handled in the unkown case ([9328f67e](https://github.com/karma-runner/karma/commit/9328f67e))
* **launchers:** Listen to the correct error event. ([45a69221](https://github.com/karma-runner/karma/commit/45a69221))
* **web-server:** Correctly update filesPromise on files updated ([32eec8d7](https://github.com/karma-runner/karma/commit/32eec8d7))


#### Features

* Upgrade to socket.io 1.3 ([603872c9](https://github.com/karma-runner/karma/commit/603872c9), closes [#1220](https://github.com/karma-runner/karma/issues/1220))
* allow frameworks to add preprocessors This changes the order in which things are ([f6f5eec3](https://github.com/karma-runner/karma/commit/f6f5eec3))
* **config:** add nocache option for file patterns ([6ef7e7b1](https://github.com/karma-runner/karma/commit/6ef7e7b1))
* **file-list:** Use glob.sync for better speed ([1b65cde4](https://github.com/karma-runner/karma/commit/1b65cde4))
* **logger:**
  * Add date/time stamp to log output ([a4b5cdde](https://github.com/karma-runner/karma/commit/a4b5cdde))
* **reporter:** cache SourceMapConsumer ([fe6ed7e5](https://github.com/karma-runner/karma/commit/fe6ed7e5))
* **runner:**
  * serve context in JSON format for JS-only environments ([189feffd](https://github.com/karma-runner/karma/commit/189feffd))
  * provide error code on 'ECONNREFUSED' callback ([439bddb1](https://github.com/karma-runner/karma/commit/439bddb1))
* **server:** improve public api ([82cbbadd](https://github.com/karma-runner/karma/commit/82cbbadd), closes [#1037](https://github.com/karma-runner/karma/issues/1037), [#1482](https://github.com/karma-runner/karma/issues/1482), [#1467](https://github.com/karma-runner/karma/issues/1467))
* **watcher:** Allow using braces in watcher ([e046379b](https://github.com/karma-runner/karma/commit/e046379b), closes [#1249](https://github.com/karma-runner/karma/issues/1249))
* **web-server:** Serve all files under urlRoot ([1319b32d](https://github.com/karma-runner/karma/commit/1319b32d))


#### Breaking Changes

* The public api interface has changed to a constructor form. To upgrade change

    ```javascript
    var server = require(‘karma’).server
    server.start(config, done)
    ```

  to

    ```javascript
    var Server = require(‘karma’).Server
    var server = new Server(config, done)
    server.start()
    ```

  Closes #1037, #1482, #1467
  ([82cbbadd](https://github.com/karma-runner/karma/commit/82cbbadd))



<a name="0.12.37"></a>
### 0.12.37 (2015-06-24)


#### Bug Fixes

* **file_list:** follow symlinks ([ee267483](https://github.com/karma-runner/karma/commit/ee267483))
* **init:** Make the requirejs config template normalize paths ([54dcce31](https://github.com/karma-runner/karma/commit/54dcce31))
* **middleware:** Actually serve the favicon. ([f12db639](https://github.com/karma-runner/karma/commit/f12db639))


<a name="0.12.36"></a>
### 0.12.36 (2015-06-04)


#### Bug Fixes

* **launcher:** Continue with exit when SIGKILL fails ([1eaccb4c](https://github.com/karma-runner/karma/commit/1eaccb4c))
* **preprocessor:** Lookup patterns once invoked ([00a27813](https://github.com/karma-runner/karma/commit/00a27813), closes [#1340](https://github.com/karma-runner/karma/issues/1340))


<a name="0.12.35"></a>
### 0.12.35 (2015-05-29)


#### Bug Fixes

* **server:** Start webserver and browsers after preprocessing completed ([e0d2d239](https://github.com/karma-runner/karma/commit/e0d2d239))


<a name="0.12.34"></a>
### 0.12.34 (2015-05-29)


#### Bug Fixes

* **cli:** Use `bin` field in package.json ([6823926f](https://github.com/karma-runner/karma/commit/6823926f), closes [#1351](https://github.com/karma-runner/karma/issues/1351))
* **client:** dynamic protocol for socket.io ([c986eefe](https://github.com/karma-runner/karma/commit/c986eefe), closes [#1400](https://github.com/karma-runner/karma/issues/1400))
* **deps:** Update dependencies ([b9a4ce98](https://github.com/karma-runner/karma/commit/b9a4ce98))


#### Features

* **runner:** Use favicon in static runner pages ([6cded4f8](https://github.com/karma-runner/karma/commit/6cded4f8))


<a name="0.12.33"></a>
### 0.12.33 (2015-05-26)


#### Bug Fixes

* catch exceptions from SourceMapConsumer ([5d42e643](https://github.com/karma-runner/karma/commit/5d42e643))
* Safeguard IE against console.log ([0b5ff8f6](https://github.com/karma-runner/karma/commit/0b5ff8f6), closes [#1209](https://github.com/karma-runner/karma/issues/1209))
* **config:** Default remaining client options if any are set ([632dd5e3](https://github.com/karma-runner/karma/commit/632dd5e3), closes [#961](https://github.com/karma-runner/karma/issues/961))
* **init:** fix test-main.(js/coffee) generation ([d8521ef4](https://github.com/karma-runner/karma/commit/d8521ef4), closes [#1120](https://github.com/karma-runner/karma/issues/1120), [#896](https://github.com/karma-runner/karma/issues/896))


<a name="0.12.31"></a>
### 0.12.31 (2015-01-02)


#### Bug Fixes

* **client:** Fix stringify serializing objects ([0d0972a5](https://github.com/karma-runner/karma/commit/0d0972a59e6e0354033c9fdfec72d5ddfbfe8e1e))


<a name="0.12.30"></a>
### 0.12.30 (2014-12-30)


#### Bug Fixes

* **socket.io:** Force 0.9.16 which works with Chrome ([840ee5f7](https://github.com/karma-runner/karma/commit/840ee5f771d547f0fd140c3728ecb92edadf835e))


<a name="0.12.29"></a>
### 0.12.29 (2014-12-30)


#### Bug Fixes

* **proxy:** proxy to correct port ([a483636e](https://github.com/karma-runner/karma/commit/a483636efd440c13e6db36f6b661861558464089))
* **watcher:** Close file watchers on exit event ([71810257](https://github.com/karma-runner/karma/commit/718102572a13d7e70d1f2c0b48b6b60a766b76b2))


<a name="0.12.28"></a>
### 0.12.28 (2014-11-25)


#### Bug Fixes

* **server:** complete acknowledgment ([f4144b0d](https://github.com/karma-runner/karma/commit/f4144b0d2d5eafff7245301454305d2005e46449))


<a name="0.12.27"></a>
### 0.12.27 (2014-11-25)


#### Bug Fixes

* **browser:** don't add already active socket again on reconnect ([37a7958a](https://github.com/karma-runner/karma/commit/37a7958ae5517b8bf16e36cc90fe0b1cf0c09afd))
* **reporter:** sourcemap not working in windows ([a9516af2](https://github.com/karma-runner/karma/commit/a9516af2af87953154e81b6080214798a9b64da5))


<a name="0.12.26"></a>
### 0.12.26 (2014-11-25)


#### Bug Fixes

* **cli:** override if an arg is defined multiple times ([31eb2c2c](https://github.com/karma-runner/karma/commit/31eb2c2c3ca1663eff94f0398768a9b582332a93), closes [#1192](https://github.com/karma-runner/karma/issues/1192))


<a name="0.12.25"></a>
### 0.12.25 (2014-11-14)


#### Bug Fixes

* add emscripten memory image as binary suffix ([f6b2b561](https://github.com/karma-runner/karma/commit/f6b2b561c5d5e083cd204df9564024cac163b611))
* Wrap url.parse to always return an object for query property ([72452e9f](https://github.com/karma-runner/karma/commit/72452e9fce4c42dc843c1157c19c08d39e3996df), closes [#1182](https://github.com/karma-runner/karma/issues/1182))
* **client.html:** always open debug.html in a new browser process ([d176bcf4](https://github.com/karma-runner/karma/commit/d176bcf47e9b3a7df8c6ae691f767f1012214c53))
* **preprocessor:** calculate sha1 on content returned from a preprocessor ([6cf79557](https://github.com/karma-runner/karma/commit/6cf795576bd6d77decac68ecc4838871b6df4836), closes [#1204](https://github.com/karma-runner/karma/issues/1204))
* **runner:** Fix typo in CSS class name for .idle ([fc5a7ce0](https://github.com/karma-runner/karma/commit/fc5a7ce0904a78ece6a9cfa29215b17bd5c1929d))


<a name="v0.12.24"></a>
### v0.12.24 (2014-09-30)


#### Bug Fixes

* Wrap url.parse to always return an object for query property ([72452e9f](https://github.com/karma-runner/karma/commit/72452e9fce4c42dc843c1157c19c08d39e3996df), closes [#1182](https://github.com/karma-runner/karma/issues/1182))

<a name="0.12.23"></a>
### 0.12.23 (2014-08-28)


#### Bug Fixes

* **file_list:** Incorrect response after remove and add file ([0dbc0201](https://github.com/karma-runner/karma/commit/0dbc0201b2d1f7c909f74816cc50bc68013fc70f))
* **preprocessor:** Throw error if can't open file ([bb4edde9](https://github.com/karma-runner/karma/commit/bb4edde9f15a07e6dac0d4dc01731f1e277d34a4))


#### Features

* **init:** install coffee-script automatically ([e876db63](https://github.com/karma-runner/karma/commit/e876db63dc5c4708345f5cdc335195fe4a5b8808), closes [#1152](https://github.com/karma-runner/karma/issues/1152))


<a name="0.12.22"></a>
### 0.12.22 (2014-08-19)


#### Bug Fixes

* **preprocessor:** treat *.tgz, *.tbz2, *.txz & *.xz as binary ([7b642449](https://github.com/karma-runner/karma/commit/7b642449811b0c0af63147f74159c6dbb8900563))


<a name="0.12.21"></a>
### 0.12.21 (2014-08-05)


#### Bug Fixes

* **web-server:** cache static files ([eb5bd53f](https://github.com/karma-runner/karma/commit/eb5bd53ff0b6dc01e247fce9af01d0ed97d8c9ba))


<a name="0.12.20"></a>
### 0.12.20 (2014-08-05)


#### Bug Fixes

* **config:** #1113 Watching is not working properly on linux ([c91ffbc0](https://github.com/karma-runner/karma/commit/c91ffbc05f78f2c17dcc43039300cdf045e64ccc), closes [#1113](https://github.com/karma-runner/karma/issues/1113))
* **preprocessor:**
  * treat *.gz files as binary ([1b56932f](https://github.com/karma-runner/karma/commit/1b56932fb49e0f3793f00599e11c24f6254236f4))
  * treat *.swf files as binary ([62d7d387](https://github.com/karma-runner/karma/commit/62d7d3873ed3e046ab24530cb20297ddad51cf85))


<a name="0.12.19"></a>
### 0.12.19 (2014-07-26)


#### Bug Fixes

* **proxy:** More useful proxyError log message ([96640a75](https://github.com/karma-runner/karma/commit/96640a75dab089255c0619733ca9d5f9fe80127d))


<a name="0.12.18"></a>
### 0.12.18 (2014-07-25)


#### Bug Fixes

* **watcher:** handle paths on Windows ([6164d869](https://github.com/karma-runner/karma/commit/6164d8699c0f07fd8fcbae88221eb35d99fb02e4))


<a name="0.12.17"></a>
### 0.12.17 (2014-07-11)


#### Bug Fixes

* **logging:** Summarize SKIPPED tests in debug.html. Before: hundreds of SKIPPING lines in con ([a01100f5](https://github.com/karma-runner/karma/commit/a01100f5c6404366dd4219b9bf6c3161300dc735), closes [#1111](https://github.com/karma-runner/karma/issues/1111))
* **server:** Force clients disconnect on Windows ([28239f42](https://github.com/karma-runner/karma/commit/28239f420460bdb9dd3b71f8088a0dfc1277dca6), closes [#1109](https://github.com/karma-runner/karma/issues/1109))
* **travis_ci:** converted node versions as string ([25ee6fc9](https://github.com/karma-runner/karma/commit/25ee6fc9c57e11a012ecc3910fcb72386a3403a1))


#### Features

* serve ePub as binary files ([82ed0c6e](https://github.com/karma-runner/karma/commit/82ed0c6e94e77757270e6694f7082eac5ef5e066))
* **preprocessor:** add 'mp3' and 'ogg' as binary formats to avoid media corruption in the browser. ([65a0767e](https://github.com/karma-runner/karma/commit/65a0767e8024879e3a5c4557f376d8b6684530e8))


<a name="v0.12.16"></a>
### v0.12.16 (2014-05-10)


#### Bug Fixes

* **launcher:** cancel kill timeout when process exits cleanly ([bd662744](https://github.com/karma-runner/karma/commit/bd662744bfbe353ccb63c7a795f691d12530129c), closes [#946](https://github.com/karma-runner/karma/issues/946))

<a name="v0.12.15"></a>
### v0.12.15 (2014-05-08)


#### Bug Fixes

* **server:** don't wait for socket.io store expiration timeout ([cd30a422](https://github.com/karma-runner/karma/commit/cd30a422fbc3d9d96b9aae791063a20d02a5f195))

<a name="v0.12.14"></a>
### v0.12.14 (2014-04-27)


#### Bug Fixes

* **debug.html:** Added whitespace after 'SKIPPED' ([218ee859](https://github.com/karma-runner/karma/commit/218ee859d8c8f1c7d2f47435548030f367f1e05d))

<a name="v0.12.13"></a>
### v0.12.13 (2014-04-27)


#### Bug Fixes

* **preprocessor:** serve NaCl binaries ([1cc6a1e3](https://github.com/karma-runner/karma/commit/1cc6a1e34b24768bffdaf47fb5e36559f5dc5135))

<a name="v0.12.12"></a>
### v0.12.12 (2014-04-25)


#### Bug Fixes

* **server:** properly close flash transport ([de89cd33](https://github.com/karma-runner/karma/commit/de89cd33b772d373569d2db2e9066c6656016aa3))

<a name="v0.12.11"></a>
### v0.12.11 (2014-04-25)


#### Bug Fixes

* **preprocessor:** remove ts from binary extensions ([82698523](https://github.com/karma-runner/karma/commit/8269852304d2d420bb25a0e4bb13bba58a339f39))

<a name="v0.12.10"></a>
### v0.12.10 (2014-04-23)


#### Bug Fixes

* **server:** clear web server close timeout on clean close ([34123fed](https://github.com/karma-runner/karma/commit/34123fed2fbe99b3a9a39ad5e0a141d55decb9f6))

<a name="v0.12.9"></a>
### v0.12.9 (2014-04-14)


#### Bug Fixes

* **web-server:** strip scheme, host and port ([06a0da09](https://github.com/karma-runner/karma/commit/06a0da09320340a988513285046b577b4a7518fd))

<a name="v0.12.8"></a>
### v0.12.8 (2014-04-14)


#### Bug Fixes

* **web-server:** inline the config, when serving debug.html ([1eb36430](https://github.com/karma-runner/karma/commit/1eb36430ca26a769cd8fd2ab5a471aecb31cad9f))

<a name="v0.12.7"></a>
### v0.12.7 (2014-04-14)


#### Bug Fixes

* don't crash/terminate upon errors within chokidar ([2c389311](https://github.com/karma-runner/karma/commit/2c389311ce683646675adccf5a7b7b3160335148))
* **preprocessor:** consider SVG files as text files, not binary files ([ff288036](https://github.com/karma-runner/karma/commit/ff2880369f0c4e8b78d95bb20365cead340f8fc9), closes [#1026](https://github.com/karma-runner/karma/issues/1026))

<a name="v0.12.6"></a>
### v0.12.6 (2014-04-09)

<a name="v0.12.5"></a>
### v0.12.5 (2014-04-08)


#### Bug Fixes

* **reporters:** format fix for console log ([d2d1377d](https://github.com/karma-runner/karma/commit/d2d1377d1be0da17196a1c82bf5584997d502b68), closes [#934](https://github.com/karma-runner/karma/issues/934))

<a name="v0.12.4"></a>
### v0.12.4 (2014-04-06)


#### Bug Fixes

* **init:** Fix type in init text ([e34465b0](https://github.com/karma-runner/karma/commit/e34465b01cc583cac9645acc98d20acbf471c856), closes [#954](https://github.com/karma-runner/karma/issues/954))

<a name="v0.12.3"></a>
### v0.12.3 (2014-04-01)


#### Bug Fixes

* **web-server:** implement a timeout on webServer.close() ([fe3dca78](https://github.com/karma-runner/karma/commit/fe3dca781def0a5f813e598fe73eb97b3f55d223), closes [#952](https://github.com/karma-runner/karma/issues/952))


#### Features

* **web-server:** run karma using multiple emulation modes, #631 ([b9a2930a](https://github.com/karma-runner/karma/commit/b9a2930a7fead5f29eb5f62b1a87739c4cf2e04b), closes [#936](https://github.com/karma-runner/karma/issues/936))

<a name="v0.12.2"></a>
### v0.12.2 (2014-03-30)

<a name="v0.12.1"></a>
### v0.12.1 (2014-03-16)


#### Features

* **preprocessor:** Adding the `dat` file extension as a recognised binary. ([be923571](https://github.com/karma-runner/karma/commit/be923571751199e0d795f620425fdf6eaf3f9818))

<a name="v0.12.0"></a>
## v0.12.0 (2014-03-10)


#### Bug Fixes

* serving binary files ([8a30cf55](https://github.com/karma-runner/karma/commit/8a30cf55751bbaec672597f4f0ed66fe8742095f), closes [#864](https://github.com/karma-runner/karma/issues/864), [#885](https://github.com/karma-runner/karma/issues/885))
* **config:**
  * fail if client.args is set to a non array ([fe4eaec0](https://github.com/karma-runner/karma/commit/fe4eaec09f1b7d34270dec7f948cd9441ef6fe48))
  * allow CoffeeScript 1.7 to be used ([a1583dec](https://github.com/karma-runner/karma/commit/a1583decd97438a241f99287159da2948eb3a95f))
* **runner:** Karma hangs when file paths have \u in them #924 ([1199fc4d](https://github.com/karma-runner/karma/commit/1199fc4d7ee7be2d48a707876ddb857544cf2fb4), closes [#924](https://github.com/karma-runner/karma/issues/924))
* **web-server:**
  * detach listeners after running ([3baa8e19](https://github.com/karma-runner/karma/commit/3baa8e1979003e4136e48515c0ba1815a950ca19))
  * close webserver after running ([f9dee468](https://github.com/karma-runner/karma/commit/f9dee4681cad716b56748e275680fb09e574978c))


#### Features

* remove dependency on coffee-script ([af2d0e72](https://github.com/karma-runner/karma/commit/af2d0e72599d242c59ebefd6c3c965bf8496399e))
* **config:** better error when Coffee/Live Script not installed ([aca84dc9](https://github.com/karma-runner/karma/commit/aca84dc9c6f4a966280bfcd080317c7c9d498f53))
* **init:** generate test-main.(js/coffee) for RequireJS projects ([85900c93](https://github.com/karma-runner/karma/commit/85900c93f070264d71fdae6c257285767119c5c2))

<a name="v0.11.14"></a>
### v0.11.14 (2014-02-04)


#### Features

* **preprocessor:** allow preprocessor to cancel test run ([4d669bf3](https://github.com/karma-runner/karma/commit/4d669bf36b091e8808c9a280900fe19c8b2a72cc), closes [#550](https://github.com/karma-runner/karma/issues/550))
* **reporter:** use spaces rather than tabs when formatting errors ([112becf7](https://github.com/karma-runner/karma/commit/112becf7ffa79d2519777300be0beff568114fe6))
* **web-server:** include html files as <link rel="import"> ([03d7b106](https://github.com/karma-runner/karma/commit/03d7b1065e31e6a42e67a0eb3e22009731865648))

<a name="v0.11.13"></a>
### v0.11.13 (2014-01-19)


#### Bug Fixes

* **launcher:** compatibility with old launchers ([df557cec](https://github.com/karma-runner/karma/commit/df557cec8093de301a8d7dea4ddca8670629c0af))


#### Features

* support LiveScript configuration ([88deebe7](https://github.com/karma-runner/karma/commit/88deebe74a0b6f01e23f3ceefea5811183218600))

<a name="v0.11.12"></a>
### v0.11.12 (2013-12-25)


#### Bug Fixes

* **client:** show error if an adapter is removed ([a8b250cf](https://github.com/karma-runner/karma/commit/a8b250cf6a89cf064f67ecb1e2c040cc224d91e9))


#### Features

* **deps:** update all deps ([355a762c](https://github.com/karma-runner/karma/commit/355a762c0fd709261ff1403213bb10db6aa0a396), closes [#794](https://github.com/karma-runner/karma/issues/794))
* **reporter:** support source maps (rewrite stack traces) ([70e4abd9](https://github.com/karma-runner/karma/commit/70e4abd9b8db6b05de557ca6e9204339a21be06b), closes [#594](https://github.com/karma-runner/karma/issues/594))
* **watcher:** use polling on Mac ([66f50d7e](https://github.com/karma-runner/karma/commit/66f50d7e584d4cbde820e70746be3f3378440fa8))

<a name="v0.11.11"></a>
### v0.11.11 (2013-12-23)


#### Bug Fixes

* **events:** resolve async events without any listener ([4e4bba88](https://github.com/karma-runner/karma/commit/4e4bba8803d1e4f461e568cc2e2ccf82e369721d))
* **launcher:**
  * compatibility with Node v0.8 ([6a46be96](https://github.com/karma-runner/karma/commit/6a46be96499876e9aa0892325d783627bd1c535d))
  * compatibility with old launchers ([ffb74800](https://github.com/karma-runner/karma/commit/ffb74800638417910f453e108c8a4c6ffabaee29))

<a name="v0.11.10"></a>
### v0.11.10 (2013-12-22)


#### Bug Fixes

* **completion:** add missin --log-level for karma init ([1e79eb55](https://github.com/karma-runner/karma/commit/1e79eb553e40530adef36b30b35a79f7a8026ddf))
* **init:** clean the terminal if killed ([e2aa7497](https://github.com/karma-runner/karma/commit/e2aa74972ce84388a49090533e353b61bd9b16ed))


#### Features

* revert default usePolling to false ([e88fbc24](https://github.com/karma-runner/karma/commit/e88fbc24dd34e7976cae2547bad07e6f044a768b))
* **config:**
  * remove default preprocessors (coffee, html2js) ([ada74d55](https://github.com/karma-runner/karma/commit/ada74d55aaf02882a5e12031838404e9ade07d36))
  * Add the abillity to supress the client console. This adds the client config opti ([4734962d](https://github.com/karma-runner/karma/commit/4734962de747c2a8eab5c8078954bd567e4b4410), closes [#744](https://github.com/karma-runner/karma/issues/744))
  * set default host/port from env vars ([0a6a0ee4](https://github.com/karma-runner/karma/commit/0a6a0ee4dd443250521d7898ab3086e7fc4f3afc))
  * Allow tests be to run in a new window instead of iframe ([471e3a8a](https://github.com/karma-runner/karma/commit/471e3a8a506836ba9711637d325c680cfbfff64f))
* **init:**
  * install karma-coffee-preprocessor ([29f5cf2d](https://github.com/karma-runner/karma/commit/29f5cf2d4b8c16a49d8528e02f781ef394e19191))
  * add nodeunit, nunit frameworks ([b4da1a08](https://github.com/karma-runner/karma/commit/b4da1a08b98414e903440d6ec2df7e94b48daea8))
  * install missing plugins (frameworks, launchers) ([1ba70a6f](https://github.com/karma-runner/karma/commit/1ba70a6fa673fbbb0c1750c777974662989dbf67))
* **launcher:** log how long it took each browser to capture ([8dd54369](https://github.com/karma-runner/karma/commit/8dd54369f2ec3377ca1cf2d9c3cdacdc80a1331a))


#### Breaking Changes

* Karma does not ship with any plugin. You need to explicitly install all the plugins you need. `karma init` can help with this.

Removed plugins that need to be installed explicitly are:

* karma-jasmine
* karma-requirejs
* karma-coffee-preprocessor
* karma-html2js-preprocessor
* karma-chrome-launcher
* karma-firefox-launcher
* karma-phantomjs-launcher
* karma-script-launcher ([e033d561](https://github.com/karma-runner/karma/commit/e033d5618a98e1f83323bb650e0eaf89c339e5b5))

<a name="v0.11.9"></a>
### v0.11.9 (2013-12-03)


#### Features

* **browser:** add browserNoActivity configuration ([bca8faad](https://github.com/karma-runner/karma/commit/bca8faad91b91baa898e3eba74fe0fa7336971c3))

<a name="v0.11.8"></a>
### v0.11.8 (2013-12-03)


#### Bug Fixes

* **reporter:** remove SHAs from stack traces ([d7c31f97](https://github.com/karma-runner/karma/commit/d7c31f97be654f08d484563282a68d59638c5693))
* **web-server:** correct caching headers for SHAs ([bf27e80b](https://github.com/karma-runner/karma/commit/bf27e80bb8ff3e60d19b408803596145c821bae7))


#### Features

* **web-server:** disable gzip compression ([5ee886bc](https://github.com/karma-runner/karma/commit/5ee886bc16fc5a2bd08101d351027345530f87df))

<a name="v0.11.7"></a>
### v0.11.7 (2013-12-02)


#### Bug Fixes

* keep all sockets in the case an old socket will survive ([a5945ebc](https://github.com/karma-runner/karma/commit/a5945ebcf11c4b17b99c40b78d7e2946f79c77c2))
* reuse browser instance when restarting disconnected browser ([1f1a8ebf](https://github.com/karma-runner/karma/commit/1f1a8ebf38827fe772c631de200fdfa4a705a40b))
* **client:** redirect to redirect_url after all messages are sent ([4d05602c](https://github.com/karma-runner/karma/commit/4d05602c803a6645d6c0e9404a60ed380f0329ee))


#### Features

* **plugins:** ignore some non-plugins package names ([01776030](https://github.com/karma-runner/karma/commit/01776030a294ef051b6454c2fb9bc3f980a6d36a))

<a name="v0.11.6"></a>
### v0.11.6 (2013-12-01)


#### Bug Fixes

* **config:**
  * ignore empty string patterns ([66c86a66](https://github.com/karma-runner/karma/commit/66c86a6689aaac82006fa47762bd86496ad76bf7))
  * apply CLI logger options as soon as we can ([16179b08](https://github.com/karma-runner/karma/commit/16179b08021334cfab02a9dcba8d7f4bd219bc5e))
* **preprocess:** set correct extension for the preprocessed path ([c9a64d2f](https://github.com/karma-runner/karma/commit/c9a64d2f1a94c0a7dab2fcde79696c139d958c57), closes [#843](https://github.com/karma-runner/karma/issues/843))


#### Features

* add `browserDisconnectTolerance` config option ([19590e1f](https://github.com/karma-runner/karma/commit/19590e1f66fd6c3b0d3fc9e90000c705198e0e70))
* make autoWatch true by default ([8454898c](https://github.com/karma-runner/karma/commit/8454898c5e2b56cb81f0c808153b5f82cfac62a4))
* **browser:** improve logging ([71b542ad](https://github.com/karma-runner/karma/commit/71b542adc6d6bd24d0ab2bb5cb0a473e1813804a))
* **client:** show error if no adapter is included ([7213877f](https://github.com/karma-runner/karma/commit/7213877f3542a4c65d91d2dbde6633b928aba049))
* **web-server:**
  * use SHA hash instead of timestamps ([6e31cb24](https://github.com/karma-runner/karma/commit/6e31cb249ee5b32d91f37ea516ca0f84bddc5aa9), closes [#520](https://github.com/karma-runner/karma/issues/520))
  * cache preprocessed files ([c786ee2e](https://github.com/karma-runner/karma/commit/c786ee2ea19d2fcef078a30cecb70d69036a4803))


#### Breaking Changes

* `autoWatch` is `true` by default. If you rely on the default value being `false`, please set it in `karma.conf.js` explicitly to `false`.
 ([8454898c](https://github.com/karma-runner/karma/commit/8454898c5e2b56cb81f0c808153b5f82cfac62a4))

<a name="v0.11.5"></a>
### v0.11.5 (2013-11-25)


#### Bug Fixes

* do not execute already executing browsers ([00136cf6](https://github.com/karma-runner/karma/commit/00136cf6d818b9bc6e4d77504e3ce1ed3d23d611))


#### Features

* **launcher:** send SIGKILL if SIGINT does not kill the browser ([c0fa49aa](https://github.com/karma-runner/karma/commit/c0fa49aa7c56f14a3836986e8629411a72515a78))

<a name="v0.11.4"></a>
### v0.11.4 (2013-11-21)


#### Bug Fixes

* **browser:** reply "start" event ([4fde43de](https://github.com/karma-runner/karma/commit/4fde43deee22b53fcca52132c51c27f4012d2933))

<a name="v0.11.3"></a>
### v0.11.3 (2013-11-20)


#### Bug Fixes

* **config:** not append empty module if no custom launcher/rep/prep ([ee15a4e4](https://github.com/karma-runner/karma/commit/ee15a4e446e9f35949a2fdde7cbdbecdd7ca0750))
* **watcher:** allow parentheses in a pattern ([438eb8dd](https://github.com/karma-runner/karma/commit/438eb8ddbc0b82cd5ab299f6f27f5ae3cc29a20f), closes [#728](https://github.com/karma-runner/karma/issues/728))


#### Features

* remove `karma` binary in favor of karma-cli ([c7d46270](https://github.com/karma-runner/karma/commit/c7d46270aca83ecfe78f69fa923bc574c0b5bfdc))
* **config:** log if no config file is specified ([ce4c5646](https://github.com/karma-runner/karma/commit/ce4c5646dfff7bd40abfd1f9e51dc4f5b779bf4a))


#### Breaking Changes

* The `karma` module does not export `karma` binary anymore. The recommended way is to have local modules (karma and all the plugins that your project needs) stored in your `package.json`. You can run that particular Karma by `./node_modules/karma/bin/karma`. Or you can have `karma-cli` installed globally on your system, which enables you to use the `karma` command.

The global `karma` command (installed by `karma-cli`) does look for local version of Karma (including parent directories) first and fall backs to a global one.

The `bin/karma` binary does not look for any other instances of Karma and just runs the one that it belongs to.


 ([c7d46270](https://github.com/karma-runner/karma/commit/c7d46270aca83ecfe78f69fa923bc574c0b5bfdc))

<a name="v0.11.2"></a>
### v0.11.2 (2013-11-03)


#### Bug Fixes

* **config:** use polling by default ([53978c42](https://github.com/karma-runner/karma/commit/53978c42f10088fb29d09597817c5dde58aeb32b))
* **proxy:** handle proxied socket.io websocket transport upgrade ([fcc2a98f](https://github.com/karma-runner/karma/commit/fcc2a98f6af5f71a929130825b18db56557f29f7))

<a name="v0.11.1"></a>
### v0.11.1 (2013-10-25)


#### Bug Fixes

* launcher kill method which was throwing an error if no callback was specified bu ([5439f1cb](https://github.com/karma-runner/karma/commit/5439f1cbbdce9de0c2193171f75798587221e257))
* **static:** Use full height for the iFrame. Fix based on PR #714. ([f95daf3c](https://github.com/karma-runner/karma/commit/f95daf3ce0af11b3c58dc09ef852ef0378b484fd))
* **watcher:**
  * ignore double "add" events ([6cbaac7a](https://github.com/karma-runner/karma/commit/6cbaac7aba0534c9a7688f6953c61505fcd1289c))
  * improve watching efficiency ([6a272aa5](https://github.com/karma-runner/karma/commit/6a272aa5763eb0c728b76adc3b12bb12abc1aaca), closes [#616](https://github.com/karma-runner/karma/issues/616))


#### Features

* redirect client to "return_url" if specified ([6af2c897](https://github.com/karma-runner/karma/commit/6af2c897f3b35060a146efdef7da597ba53d8cdd))
* **config:** add usePolling config ([18514d63](https://github.com/karma-runner/karma/commit/18514d63534c82094b231eb1e0b0e41011519183))
* **watcher:** ignore initial "add" events ([dde1da4c](https://github.com/karma-runner/karma/commit/dde1da4c78470fec3565920df418a3786fb57797))

<a name="v0.11.0"></a>
## v0.11.0 (2013-08-26)


#### Bug Fixes

* support reconnecting for manually captured browsers ([a8ac6d2d](https://github.com/karma-runner/karma/commit/a8ac6d2d86cad3898d21f019b6fc0a5a2b99cd00))
* **reporter:** print browser stats immediately after it finishes ([65202d87](https://github.com/karma-runner/karma/commit/65202d870fa602e70483aeebbf87d0e11d6c1017))


#### Features

* don't wait for all browsers and start executing immediately ([8647266f](https://github.com/karma-runner/karma/commit/8647266fd592fe245aaf2be964319d3026432e33), closes [#57](https://github.com/karma-runner/karma/issues/57))

<a name="v0.10.2"></a>
### v0.10.2 (2013-08-21)


#### Bug Fixes

* don't mark a browser captured if already being killed/timeouted ([21230979](https://github.com/karma-runner/karma/commit/212309795861cf599dbcc0ed60fff612ccf25cf5), closes [#88](https://github.com/karma-runner/karma/issues/88))


#### Features

* sync page unload (disconnect) ([ac9b3f01](https://github.com/karma-runner/karma/commit/ac9b3f01e88ce2cf91fc86aca9cecfdb8177a6fa))
* buffer result messages when polling ([c4ad6970](https://github.com/karma-runner/karma/commit/c4ad69709103110a066ae1d9652af69e42434c6b))
* allow browser to reconnect during the test run ([cbe2851b](https://github.com/karma-runner/karma/commit/cbe2851baa55312f00be420e0345283b33326266), closes [#82](https://github.com/karma-runner/karma/issues/82), [#590](https://github.com/karma-runner/karma/issues/590))

<a name="v0.10.1"></a>
### v0.10.1 (2013-08-06)


#### Bug Fixes

* **cli:** Always pass an instance of fs to processArgs. ([06532b70](https://github.com/karma-runner/karma/commit/06532b7042371f270c227a1a7f859f2dab5afac1), closes [#677](https://github.com/karma-runner/karma/issues/677))
* **init:** set default filename ([34d49b13](https://github.com/karma-runner/karma/commit/34d49b138f3bee8f17e1e9e343012d82887f906b), closes [#680](https://github.com/karma-runner/karma/issues/680), [#681](https://github.com/karma-runner/karma/issues/681))

<a name="v0.10.0"></a>
## v0.10.0 (2013-08-06)

<a name="v0.9.8"></a>
### v0.9.8 (2013-08-05)


#### Bug Fixes

* **init:** install plugin as dev dependency ([46b7a402](https://github.com/karma-runner/karma/commit/46b7a402fb8d700b10e2d72908c309d27212b5a0))
* **runner:** do not confuse client args with the config file ([6f158aba](https://github.com/karma-runner/karma/commit/6f158abaf923dad6878a64da2d8a3c2c56ae604f))


#### Features

* **config:** default config can be karma.conf.js or karma.conf.coffee ([d4a06f29](https://github.com/karma-runner/karma/commit/d4a06f296c4d805f2dccd85b4898766593af4d66))
* **runner:**
  * support config files ([449e4a1a](https://github.com/karma-runner/karma/commit/449e4a1ad8b8543f84f1953c875cfbdf5692caa7), closes [#625](https://github.com/karma-runner/karma/issues/625))
  * add --no-refresh to disable re-globbing ([b9c670ac](https://github.com/karma-runner/karma/commit/b9c670accbde8d027bdc3e09a4080c546b05853c))

<a name="v0.9.7"></a>
### v0.9.7 (2013-07-31)


#### Bug Fixes

* **init:** trim the inputs ([b72355cb](https://github.com/karma-runner/karma/commit/b72355cbeadc8e907e48bbd7d9a11e6de17343f7), closes [#663](https://github.com/karma-runner/karma/issues/663))
* **web-server:** correct urlRegex in custom handlers ([a641c2c1](https://github.com/karma-runner/karma/commit/a641c2c1dd0f5f1e0045e7cff1516d2820a8204e))


#### Features

* basic bash/zsh completion ([9dc1cf6a](https://github.com/karma-runner/karma/commit/9dc1cf6a6e095653fed6c79c4896c71af8af1953))
* **runner:** allow passing changed/added/removed files ([b598106d](https://github.com/karma-runner/karma/commit/b598106de1295f3e1e58338a8eca2b60f99175c3))
* **watcher:** make the batching delay configurable ([fa139312](https://github.com/karma-runner/karma/commit/fa139312a0fff981f11182c17ba6979dccca1105))

<a name="v0.9.6"></a>
### v0.9.6 (2013-07-28)


#### Features

* pass command line opts through to browser ([00d63d0b](https://github.com/karma-runner/karma/commit/00d63d0b965a998b04d1917d4c4421abc24cec18))
* **web-server:** compress responses (gzip/deflate) ([8e8a2d44](https://github.com/karma-runner/karma/commit/8e8a2d4418e7abef7dca42e58bf09c95b07687b2))


#### Breaking Changes

* `runnerPort` is merged with `port`
if you are using `karma run` with custom `--runer-port`, please change that to `--port`.
 ([ca4c4d88](https://github.com/karma-runner/karma/commit/ca4c4d88b9a4a1992f7975aa32b37a008394847b))

<a name="v0.9.5"></a>
### v0.9.5 (2013-07-21)


#### Bug Fixes

* detect a full page reload, show error and recover ([15d80f47](https://github.com/karma-runner/karma/commit/15d80f47a227839e9b0d54aeddf49b9aa9afe8aa), closes [#27](https://github.com/karma-runner/karma/issues/27))
* better serialization in dump/console.log ([fd46365d](https://github.com/karma-runner/karma/commit/fd46365d1fd3a9bea15c04abeb7df33a3a2d96a4), closes [#640](https://github.com/karma-runner/karma/issues/640))
* browsers_change event always has collection as arg ([42bf787f](https://github.com/karma-runner/karma/commit/42bf787f87304e6be23dd3dac893b3c3f77d6764))
* **init:** generate config with the new syntax ([6b27fee5](https://github.com/karma-runner/karma/commit/6b27fee5a43a7d02e706355f62fe5105b4966c43))
* **reporter:** prevent throwing exception when null is sent to formatter ([3b49c385](https://github.com/karma-runner/karma/commit/3b49c385fcc8ef96e72be390df058bd278b40c17))
* **watcher:** ignore fs.stat errors ([74ccc9a8](https://github.com/karma-runner/karma/commit/74ccc9a8017f869bd7bbbf8831415964110a7073))


#### Features

* capture window.alert ([284c4f5c](https://github.com/karma-runner/karma/commit/284c4f5c9c481759fe564627a00d72ba5c54e433))
* ship html2js preprocessor as a default plugin ([37ecf416](https://github.com/karma-runner/karma/commit/37ecf41600a9b255ab3d57327cc83d64751642f5))
* fail if zero tests executed ([5670415e](https://github.com/karma-runner/karma/commit/5670415ecdc5e54902b479c78df5c3c422855e5c), closes [#468](https://github.com/karma-runner/karma/issues/468))
* **launcher:** normalize quoted paths ([f2155e0c](https://github.com/karma-runner/karma/commit/f2155e0c3305538c0fb95791e56f34743977a865), closes [#491](https://github.com/karma-runner/karma/issues/491))
* **web-server:** serve css files ([4e305545](https://github.com/karma-runner/karma/commit/4e305545ddf2726c1fe65c46efd5e7c1045ac041), closes [#431](https://github.com/karma-runner/karma/issues/431))

<a name="v0.9.4"></a>
### v0.9.4 (2013-06-28)


#### Bug Fixes

* **config:**
  * make the config changes backwards compatible ([593ad853](https://github.com/karma-runner/karma/commit/593ad853c330a7856f2112db2bfb288f67948fa6))
  * better errors if file invalid or does not exist ([74b533be](https://github.com/karma-runner/karma/commit/74b533beb34c115f5080d412a03573d269d540aa))
  * allow parsing the config multiple times ([78a7094e](https://github.com/karma-runner/karma/commit/78a7094e0f262c431e904f99cf356be53eee3510))
* **launcher:** better errors when loading launchers ([504e848c](https://github.com/karma-runner/karma/commit/504e848cf66b065380fa72e07f5337ae2d6e35b5))
* **preprocessor:**
  * do not show duplicate warnings ([47c641f7](https://github.com/karma-runner/karma/commit/47c641f7560d28e0d9eac7ae010566d296d5b628))
  * better errors when loading preprocessors ([3390a00b](https://github.com/karma-runner/karma/commit/3390a00b49c513a6da60f48044462118436130f8))
* **reporter:** better errors when loading reporters ([c645c060](https://github.com/karma-runner/karma/commit/c645c060c4f381902c2005eefe5b3a7bfa63cdcc))


#### Features

* **config:** pass the config object rather than a wrapper ([d2a3c854](https://github.com/karma-runner/karma/commit/d2a3c8546dc4b10bb9194047a1c11963639f3730))


#### Breaking Changes

* please update your karma.conf.js as follows ([d2a3c854](https://github.com/karma-runner/karma/commit/d2a3c8546dc4b10bb9194047a1c11963639f3730)):

```javascript
// before:
module.exports = function(karma) {
  karma.configure({port: 123});
  karma.defineLauncher('x', 'Chrome', {
    flags: ['--disable-web-security']
  });
  karma.definePreprocessor('y', 'coffee', {
    bare: false
  });
  karma.defineReporter('z', 'coverage', {
    type: 'html'
  });
};

// after:
module.exports = function(config) {
  config.set({
    port: 123,
    customLaunchers: {
      'x': {
        base: 'Chrome',
        flags: ['--disable-web-security']
      }
    },
    customPreprocessors: {
      'y': {
        base: 'coffee',
        bare: false
      }
    },
    customReporters: {
      'z': {
        base: 'coverage',
        type: 'html'
      }
    }
  });
};
```

<a name="v0.9.3"></a>
### v0.9.3 (2013-06-16)


#### Bug Fixes

* capturing console.log on IE ([fa4b686a](https://github.com/karma-runner/karma/commit/fa4b686a81ad826f256a4ca63c772af7ad6e411e), closes [#329](https://github.com/karma-runner/karma/issues/329))
* **config:** fix the warning when using old syntax ([5e55d797](https://github.com/karma-runner/karma/commit/5e55d797f7544a45c3042e301bbf71e8b830daf3))
* **init:** generate correct indentation ([5fc17957](https://github.com/karma-runner/karma/commit/5fc17957be761c06f6ae120c5d3ba800dba8d3a4))
* **launcher:**
  * ignore exit code when killing/timeouting ([1029bf2d](https://github.com/karma-runner/karma/commit/1029bf2d7d3d22986aa41439d2ce4115770f4dbd), closes [#444](https://github.com/karma-runner/karma/issues/444))
  * handle ENOENT error, do not retry ([7d790b29](https://github.com/karma-runner/karma/commit/7d790b29c09c1f3784fe648b7d5ed16add10b4ca), closes [#452](https://github.com/karma-runner/karma/issues/452))
* **logger:** configure the logger as soon as possible ([0607d67c](https://github.com/karma-runner/karma/commit/0607d67c15eab58ce83cce14ada70a1e2a9f17e9))
* **preprocessor:** use graceful-fs to prevent EACCESS errors ([279bcab5](https://github.com/karma-runner/karma/commit/279bcab54019a0f0af72c7c08017cf4cdefebe46), closes [#566](https://github.com/karma-runner/karma/issues/566))
* **watcher:** watch files that match watched directory ([39401175](https://github.com/karma-runner/karma/commit/394011753b918b8db807f31da9f5c316e296cf32), closes [#521](https://github.com/karma-runner/karma/issues/521))


#### Features

* simplify loading plugins using patterns like `karma-*` ([405a5a62](https://github.com/karma-runner/karma/commit/405a5a62d2ecc47a46b2ff069bfeb624f0b06982))
* **client:** capture all `console.*` log methods ([683e6dcb](https://github.com/karma-runner/karma/commit/683e6dcb9132de3caee39c809b5b58efe8236564))
* **config:**
  * make socket.io transports configurable ([bbd5eb86](https://github.com/karma-runner/karma/commit/bbd5eb8688b2bc1e3dd04910aa68fd19c5036b31))
  * allow configurable launchers, preprocessors, reporters ([76bdac16](https://github.com/karma-runner/karma/commit/76bdac1681f012749648f5a76b4a9d96c7a5ef20), closes [#317](https://github.com/karma-runner/karma/issues/317))
  * add warning if old constants are used ([7233c5fb](https://github.com/karma-runner/karma/commit/7233c5fb9e1c105032000bbcb9afaddf72ccbc97))
  * require config as a regular module ([a37fd6f7](https://github.com/karma-runner/karma/commit/a37fd6f7d28036b8da5fe98634cf711cebafc1ff), closes [#304](https://github.com/karma-runner/karma/issues/304))
* **helper:** improve useragent detection ([eb58768e](https://github.com/karma-runner/karma/commit/eb58768e32baf13b45d9649743d7ef45798ffb27))
* **init:**
  * generate coffee config files ([d2173717](https://github.com/karma-runner/karma/commit/d21737176c1d866a11249d626a75440b398171ce))
  * improve the questions a bit ([baecadb2](https://github.com/karma-runner/karma/commit/baecadb2f1a8f31c233edacafb1f8a4b736ea243))
* **proxy:** add https proxy support ([be878dc5](https://github.com/karma-runner/karma/commit/be878dc545a0dd266d5686387c976ce70f1a095c))


#### Breaking Changes

* Update your karma.conf.js to export a config function ([a37fd6f7](https://github.com/karma-runner/karma/commit/a37fd6f7d28036b8da5fe98634cf711cebafc1ff)):

```javascript
module.exports = function(karma) {
  karma.configure({
    autoWatch: true,
    // ...
  });
};
```

<a name="v0.9.2"></a>
### v0.9.2 (2013-04-16)


#### Bug Fixes

* better error reporting when loading plugins ([d9078a8e](https://github.com/karma-runner/karma/commit/d9078a8eca41df15f26b53e2375f722a48d0992d))
* **config:**
  * Separate ENOENT error handler from others ([e49dabe7](https://github.com/karma-runner/karma/commit/e49dabe783d6cfb2ee97b70ac01953e82f70f831))
  * ensure basePath is always resolved ([2e5c5aaa](https://github.com/karma-runner/karma/commit/2e5c5aaaddc4ad4e1ee9c8fa0388d3916827f403))


#### Features

* allow inlined plugins ([3034bcf9](https://github.com/karma-runner/karma/commit/3034bcf9b074b693afab9c62856346d6f305d0c0))
* **debug:** show skipped specs and failure details in the console ([42ab936b](https://github.com/karma-runner/karma/commit/42ab936b254983faa8ab0ee76a6278fb3aff7fa2))

<a name="v0.9.1"></a>
### v0.9.1 (2013-04-04)


#### Bug Fixes

* **init:** to not give false warning about missing requirejs ([562607a1](https://github.com/karma-runner/karma/commit/562607a16221b256c6e92ad2029154aac88eec8d))


#### Features

* ship coffee-preprocessor and requirejs as default plugins ([f34e30db](https://github.com/karma-runner/karma/commit/f34e30db4d25d484a30d12e3cb1c41069c0b263a))

<a name="v0.9.0"></a>
## v0.9.0 (2013-04-03)


#### Bug Fixes

* global error handler should propagate errors ([dec0c196](https://github.com/karma-runner/karma/commit/dec0c19651c251dcbc16c44a57775bcb37f78cf1), closes [#368](https://github.com/karma-runner/karma/issues/368))
* **config:**
  * Check if configFilePath is a string. Fixes #447. ([98724b6e](https://github.com/karma-runner/karma/commit/98724b6ef5a6ba60d487e7b774056832c6ca9d8c))
  * do not change urlRoot even if proxied ([8c138b50](https://github.com/karma-runner/karma/commit/8c138b504046a3aeb230b71e1049aa60ee46905d))
* **coverage:** always send a result object ([62c3c679](https://github.com/karma-runner/karma/commit/62c3c6790659f8f82f8a2ca5646aa424eeb28842), closes [#365](https://github.com/karma-runner/karma/issues/365))
* **init:**
  * generate plugins and frameworks config ([17798d55](https://github.com/karma-runner/karma/commit/17798d55988d61070f2b9f59574217208f2b497e))
  * fix for failing "testacular init" on Windows ([0b5b3853](https://github.com/karma-runner/karma/commit/0b5b385383f13ac8f29fa6e591a8634eefa04ab7))
* **preprocessor:** resolve relative patterns to basePath ([c608a9e5](https://github.com/karma-runner/karma/commit/c608a9e5a34a49da2971add8759a9422b74fa6fd), closes [#382](https://github.com/karma-runner/karma/issues/382))
* **runner:** send exit code as string ([ca75aafd](https://github.com/karma-runner/karma/commit/ca75aafdf6b7b425ee151c2ae4ede37933befe1f), closes [#403](https://github.com/karma-runner/karma/issues/403))


#### Features

* display the version when starting ([39617395](https://github.com/karma-runner/karma/commit/396173952addce3f6e904310686a42b102aa53f8), closes [#391](https://github.com/karma-runner/karma/issues/391))
* allow multiple preprocessors ([1d17c1aa](https://github.com/karma-runner/karma/commit/1d17c1aacf607d6c4269f05df97d024bc9ca994e))
* allow plugins ([125ab4f8](https://github.com/karma-runner/karma/commit/125ab4f88a7cf49fd7df32264a9847847e2326ca))
* **config:**
  * always ignore the config file itself ([103bc0f8](https://github.com/karma-runner/karma/commit/103bc0f878a8870770c8a8afce0a3fbf8a516ea7))
  * normalize string preprocessors into an array ([4dde1608](https://github.com/karma-runner/karma/commit/4dde16087d0a704a47528d44e23ace0c536d8c72))
* **web-server:** allow custom file handlers and mime types ([2df88287](https://github.com/karma-runner/karma/commit/2df8828742041fd09c0b45d6a62ebd7552116589))


#### Breaking Changes

* reporters, launchers, preprocessors, adapters are separate plugins now, in order to use them, you need to install the npm package (probably add it as a `devDependency` into your `package.json`) and load in the `karma.conf.js` with `plugins = ['karma-jasmine', ...]`. Karma ships with couple of default plugins (karma-jasmine, karma-chrome-launcher, karma-phantomjs-launcher).

* frameworks (such as jasmine, mocha, qunit) are configured using `frameworks = ['jasmine'];` instead of prepending `JASMINE_ADAPTER` into files.


<a name="v0.8.0"></a>
## v0.8.0 (2013-03-18)


#### Breaking Changes

- rename the project to "Karma":
- whenever you call the "testacular" binary, change it to "karma", eg. `testacular start` becomes `karma start`.
- if you rely on default name of the config file, change it to `karma.conf.js`.
- if you access `__testacular__` object in the client code, change it to `__karma__`, eg. `window.__testacular__.files` becomes `window.__karma__.files`. ([026a20f7](https://github.com/karma-runner/karma/commit/026a20f7b467eb3b39c68ed509acc06e5dad58e6))

<a name="v0.6.1"></a>
### v0.6.1 (2013-03-18)


#### Bug Fixes

* **config:** do not change urlRoot even if proxied ([1be1ae1d](https://github.com/karma-runner/karma/commit/1be1ae1dc7ff7314f4ac2854815cb39d31362f14))
* **coverage:** always send a result object ([2d210aa6](https://github.com/karma-runner/karma/commit/2d210aa6697991f2eba05de58a696c5210485c88), closes [#365](https://github.com/karma-runner/karma/issues/365))
* **reporter.teamcity:** report spec names and proper browser name ([c8f6f5ea](https://github.com/karma-runner/karma/commit/c8f6f5ea0c5c40d37b511d51b49bd22c9da5ea86))

<a name="v0.6.0"></a>
## v0.6.0 (2013-02-22)

<a name="v0.5.11"></a>
### v0.5.11 (2013-02-21)


#### Bug Fixes

* **adapter.requirejs:** do not configure baseUrl automatically ([63f3f409](https://github.com/karma-runner/karma/commit/63f3f409ae85a5137396a7ed6537bedfe4437cb3), closes [#291](https://github.com/karma-runner/karma/issues/291))
* **init:** add missing browsers (Opera, IE) ([f39e5645](https://github.com/karma-runner/karma/commit/f39e5645ec561c2681d907f7c1611f01911ee8fd))
* **reporter.junit:** Add browser log output to JUnit.xml ([f108799a](https://github.com/karma-runner/karma/commit/f108799a4d8fd95b8c0250ee83c23ada25d026b9), closes [#302](https://github.com/karma-runner/karma/issues/302))


#### Features

* add Teamcity reporter ([03e700ae](https://github.com/karma-runner/karma/commit/03e700ae2234ca7ddb8f9235343e3b0c80868bbd))
* **adapter.jasmine:** remove only last failed specs anti-feature ([435bf72c](https://github.com/karma-runner/karma/commit/435bf72cb12112462940c8114fbaa19f9de38531), closes [#148](https://github.com/karma-runner/karma/issues/148))
* **config:** allow empty config file when called programmatically ([f3d77424](https://github.com/karma-runner/karma/commit/f3d77424009f621e1fb9d60eeec7f052ebb3c585), closes [#358](https://github.com/karma-runner/karma/issues/358))

<a name="v0.5.10"></a>
### v0.5.10 (2013-02-14)


#### Bug Fixes

* **init:** fix the logger configuration ([481dc3fd](https://github.com/karma-runner/karma/commit/481dc3fd75f45a0efa8aabdb1c71e8234b9e8a06), closes [#340](https://github.com/karma-runner/karma/issues/340))
* **proxy:** fix crashing proxy when browser hangs connection ([1c78a01a](https://github.com/karma-runner/karma/commit/1c78a01a19411accb86f0bde9e040e5088752575))


#### Features

* set urlRoot to /__karma__/ when proxying the root ([8b4fd64d](https://github.com/karma-runner/karma/commit/8b4fd64df6b7d07b5479e43dcd8cd2aa5e1efc9c))
* **adapter.requirejs:** normalize paths before appending timestamp ([94889e7d](https://github.com/karma-runner/karma/commit/94889e7d2de701c67a2612e3fc6a51bfae891d36))
* update dependencies to the latest ([93f96278](https://github.com/karma-runner/karma/commit/93f9627817f2d5d9446de9935930ca85cfa7df7f), [e34d8834](https://github.com/karma-runner/karma/commit/e34d8834d69ec4e022fcd6e1be4055add96d693c))


<a name="v0.5.9"></a>
### v0.5.9 (2013-02-06)


#### Bug Fixes

* **adapter.requirejs:** show error if no timestamp defined for a file ([59dbdbd1](https://github.com/karma-runner/karma/commit/59dbdbd136baa87467b9b9a4cb6ce226ae87bbef))
* **init:** fix logger configuration ([557922d7](https://github.com/karma-runner/karma/commit/557922d71941e0929f9cdc0d3794424a1f27b311))
* **reporter:** remove newline from base reporter browser dump ([dfae18b6](https://github.com/karma-runner/karma/commit/dfae18b63b413a1e6240d00b9dc0521ac0386ec5), closes [#297](https://github.com/karma-runner/karma/issues/297))
* **reporter.dots:** only add newline to message when needed ([dbe1155c](https://github.com/karma-runner/karma/commit/dbe1155cb57fc4caa792f83f45288238db0fc7e0)

#### Features

* add "debug" button to easily open debugging window ([da85aab9](https://github.com/karma-runner/karma/commit/da85aab927edd1614e4e05b136dee834344aa3cb))
* **config:** support running on a custom hostname ([b8c5fe85](https://github.com/karma-runner/karma/commit/b8c5fe8533b13fd59cbf48972d2021069a84ae5b))
* **reporter.junit:** add a 'skipped' tag for skipped testcases ([6286406e](https://github.com/karma-runner/karma/commit/6286406e0a36a61125ea16d6f49be07030164cb0), closes [#321](https://github.com/karma-runner/karma/issues/321))


### v0.5.8
* Fix #283
* Suppress global leak for istanbul
* Fix growl reporter to work with `testacular run`
* Upgrade jasmine to 1.3.1
* Fix file sorting
* Fix #265
* Support for more mime-types on served static files
* Fix opening Chrome on Windows
* Upgrade growly to 1.1.0

### v0.5.7
* Support code coverage for qunit.
* Rename port-runner option in cli to runner-port
* Fix proxy handler (when no proxy defined)
* Fix #65

### v0.5.6
* Growl reporter !
* Batch changes (eg. `git checkout` causes only single run now)
* Handle uncaught errors and disconnect all browsers
* Global binary prefers local versions

### v0.5.5
* Add QUnit adapter
* Report console.log()

### v0.5.4
* Fix PhantomJS launcher
* Fix html2js preprocessor
* NG scenario adapter: show html output

### v0.5.3
* Add code coverage !

### v0.5.2
* Init: ask about using Require.js

### v0.5.1
* Support for Require.js
* Fix testacular init basePath

## v0.5.0
* Add preprocessor for LiveScript
* Fix JUnit reporter
* Enable process global in config file
* Add OS name in the browser name
* NG scenario adapter: hide other outputs to make it faster
* Allow config to be written in CoffeeScript
* Allow espaced characters in served urls

## v0.4.0 (stable)

### v0.3.12
* Allow calling run() pragmatically from JS

### v0.3.11
* Fix runner to wait for stdout, stderr
* Make routing proxy always changeOrigin

### v0.3.10
* Fix angular-scenario adapter + junit reporter
* Use flash socket if web socket not available

### v0.3.9
* Retry starting a browser if it does not capture
* Update mocha to 1.5.0
* Handle mocha's xit

### v0.3.8
* Kill browsers that don't capture in captureTimeout ms
* Abort build if any browser fails to capture
* Allow multiple profiles of Firefox

### v0.3.7
* Remove Travis hack
* Fix Safari launcher

### v0.3.6
* Remove custom launcher (constructor)
* Launcher - use random id to allow multiple instances of the same browser
* Fix Firefox launcher (creating profile)
* Fix killing browsers on Linux and Windows

### v0.3.5
* Fix opera launcher to create new prefs with disabling all pop-ups

### v0.3.4
* Change "reporter" config to "reporters"
* Allow multiple reporters
* Fix angular-scenario adapter to report proper description
* Add JUnit xml reporter
* Fix loading files from multiple drives on Windows
* Fix angular-scenario adapter to report total number of tests

### v0.3.3
* Allow proxying files, not only directories

### v0.3.2
* Disable autoWatch if singleRun
* Add custom script browser launcher
* Fix cleaning temp folders

### v0.3.1
* Run tests on start (if watching enabled)
* Add launcher for IE8, IE9

## v0.3.0
* Change browser binaries on linux to relative
* Add report-slower-than to CLI options
* Fix PhantomJS binary on Travis CI

## v0.2.0 (stable)

### v0.1.3
* Launch Canary with crankshaft disabled
* Make the captured page nicer

### v0.1.2
* Fix jasmine memory leaks
* support __filename and __dirname in config files

### v0.1.1
* Report slow tests (add `reportSlowerThan` config option)
* Report time in minutes if it's over 60 seconds
* Mocha adapter: add ability to fail during beforeEach/afterEach hooks
* Mocha adapter: add dump()
* NG scenario adapter: failure includes step name
* Redirect /urlRoot to /urlRoot/
* Fix serving with urlRoot

## v0.1.0
* Adapter for AngularJS scenario runner
* Allow serving Testacular from a subpath
* Fix race condition in testacular run
* Make testacular one binary (remove `testacular-run`, use `testacular run`)
* Add support for proxies
* Init script for generating config files (`testacular init`)
* Start Firefox without custom profile if it fails
* Preserve order of watched paths for easier debugging
* Change default port to 9876
* Require node v0.8.4+

### v0.0.17
* Fix race condition in manually triggered run
* Fix autoWatch config

### v0.0.16
* Mocha adapter
* Fix watching/resolving on Windows
* Allow glob patterns
* Watch new files
* Watch removed files
* Remove unused config (autoWatchInterval)

### v0.0.15
* Remove absolute paths from urls (fixes Windows issue with C:\\)
* Add browser launcher for PhantomJS
* Fix some more windows issues

### v0.0.14
* Allow require() inside config file
* Allow custom browser launcher
* Add browser launcher for Opera, Safari
* Ignore signals on windows (not supported yet)

### v0.0.13
* Single run mode (capture browsers, run tests, exit)
* Start browser automatically (chrome, canary, firefox)
* Allow loading external files (urls)

### v0.0.12
* Allow console in config
* Warning if pattern does not match any file

### v0.0.11
* Add timing (total / net - per specs)
* Dots reporter - wrap at 80

### v0.0.10
* Add DOTS reporter
* Add no-colors option for reporters
* Fix web server to expose only specified files

### v0.0.9
* Proper exit code for runner
* Dynamic port asigning (if port already in use)
* Add log-leve, log-colors cli arguments + better --help
* Fix some IE errors (indexOf, forEach fallbacks)

### v0.0.8
* Allow overriding configuration by cli arguments (+ --version, --help)
* Persuade IE8 to not cache context.html
* Exit runner if no captured browser
* Fix delayed execution (streaming to runner)
* Complete run if browser disconnects
* Ignore results from previous run (after server reconnecting)
* Server disconnects - cancel execution, clear browser info

### v0.0.7
* Rename to Testacular

### v0.0.6
* Better debug mode (no caching, no timestamps)
* Make dump() a bit better
* Disconnect browsers on SIGTERM (kill, killall default)

### v0.0.5
* Fix memory (some :-D) leaks
* Add dump support
* Add runner.html

### v0.0.4
* Progress bar reporting
* Improve error formatting
* Add Jasmine lib (with iit, ddescribe)
* Reconnect client each 2sec, remove exponential growing

### v0.0.3
* Jasmine adapter: ignore last failed filter in exclusive mode
* Jasmine adapter: add build (no global space pollution)

### 0.0.2
* Run only last failed tests (jasmine adapter)

### 0.0.1
* Initial version with only very basic features
