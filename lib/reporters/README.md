## browserConsoleLogOptions
The configuration *browserConsoleLogOptions* has been augmented.

The **muteCommonMsg** param is added.

**Type:** _Object_

**Description:** Configure for which _reporters_ the common messages are disabled/muted

```javascript
browserConsoleLogOptions: {
  muteCommonMsg: {
    dots: true,
    coverageistanbul: true
  }
}
```

:exclamation: :exclamation: :exclamation:  
> The responders' names will lose the "**-**" character.
>
> coverage-istanbul => coverageistanbul
