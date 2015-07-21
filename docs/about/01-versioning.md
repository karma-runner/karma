Karma uses [Semantic Versioning]. We publish unstable versions as `rc` versions, e.g. the current stable could look like `0.13.2` and the unstable would be something like `0.14.0-rc.1`.

It is recommended that you rely on the latest stable version, which will give you automatic bug fixes, but will not break your test setup:
```javascript
{
  "devDependencies": {
    "karma": "^0.13"
  }
}
```

## Stable channel (branch `master`)
```bash
$ npm install karma
```

## Canary channel (branch `canary`)
```bash
$ npm install karma@canary
```

[Semantic Versioning]: http://semver.org
