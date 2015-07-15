Karma uses [Semantic Versioning]. We publish unstable versions as `rc` versions, e.g. the current stable could look like `0.12.36` and the unstable would be something like `0.13.0-rc.4`.

It is recommended that you rely on the latest stable version, which will give you automatic bug fixes, but will not break your test setup:
```javascript
{
  "devDependencies": {
    "karma": "^0.12"
  }
}
```

## Stable channel (branch `stable`)
```bash
$ npm install karma
```

## Canary channel (branch `master`)
```bash
$ npm install karma@canary
```

[Semantic Versioning]: http://semver.org
