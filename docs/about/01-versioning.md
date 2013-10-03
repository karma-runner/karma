Karma uses [Semantic Versioning] with a little exception:
- even versions (eg. `0.6.x`, `0.8.x`) are considered stable - no breaking changes or new features, only bug fixes will pushed into this branch,
- odd versions (eg. `0.7.x`, `0.9.x`) are unstable - anything can happen ;-)

Therefore it is recommended to rely on the latest stable version, which gives you automatic bug fixes, but does not break you:
```javascript
{
  "devDependencies": {
    "karma": "~0.10"
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

[Semantic Versioning]: http://semver.org/
