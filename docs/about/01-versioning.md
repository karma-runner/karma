Karma uses [Semantic Versioning]. There are some special rules at the moment,
as we have not yet released a `1.0.0`.

* Minor versions could introduce breaking changes.
* Patch versions are expected to be compatible at all times.

It is recommended that you add the following entry to your `package.json`
file, either manually
```javascript
{
  "devDependencies": {
    "karma": "^0.13.0"
  }
}
```

or by running

```bash
$ npm --save-dev install karma
```

[Semantic Versioning]: http://semver.org
