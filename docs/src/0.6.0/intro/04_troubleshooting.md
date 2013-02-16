# Troubleshooting

You have some problems? Look no further. Known problems and solutions are collected here so you don't have to figure them out again and again.

If you can't find solution to your problem here, feel free to ask on the [mailing list].

Before complaining, please make sure you are on the latest version.

## Windows

### Tips & Tricks

* Use [chocolatey] for installation of tools. It helps. A lot.

### Specific problems

* Chrome won't start. (Issues: [#202], [#74])

  1. Set `CHROME_BIN` like this
     ```
     > export CHROME_BIN='C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
     ```
  3. Increase the timeout from 5000ms to 10000ms. At 5000ms, timeouts occurred and the retry logic kicks in and eventually resolves after 2~3 tries.



[#202]: https://github.com/testacular/testacular/issues/202
[#74]: https://github.com/testacular/testacular/issues/74
[chocolatey]: (http://chocolatey.org/)
[mailing list]: https://groups.google.com/forum/#!forum/testacular
