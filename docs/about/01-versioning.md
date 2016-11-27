Karma uses [Semantic Versioning]. This means,

* Major versions could introduce breaking changes.
* Minor versions could introduce backwards compatible features and are expected to be compatible at all times.
* Patch versions are expected to be compatible at all times.

It is recommended that you add the following entry to your `package.json`
file, either manually

```javascript
{
  "devDependencies": {
    "karma": "^1.3.0"
  }
}
```

or by running

```bash
$ npm install --save-dev karma
```

[Semantic Versioning]: http://semver.org
