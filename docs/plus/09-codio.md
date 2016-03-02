[Codio] is a web-based cloud integrated development environment that supports almost any programming language. Every project gets its individual Box: an instantly available server-side development environment with full terminal access. Unlimited panels and tabs, and a plethora of productivity features. 

##Customize your Codio Project

Next to the help menu you will see the "Configure" option, if you don't see it click the little arrow near the end and then select "Configure".


This opens a .codio file which you can customize and use rather than entering commands in Terminal. Replace the existing text with the text below:


    {
    // Configure your Run and Preview buttons here.

    // Run button configuration
      "commands": {
        "Karma Start": "karma start --no-browsers"
        "Karam Run": "karma run"
      },

    // Preview button configuration
      "preview": {
        "Karma Preview": "http://{{domain}}:8080"
      }
    }


*If you wish, you can change the port for the `Karma Preview` entry, but make a note of the change as you will need to include that port in the `karma.config js` file later.*


## Configuration

- Edit the `karma.conf.js` and add the following:


        // hostname for the server
        hostname: require('os').hostname() + '.codio.io',


- Review webserver port entry to ensure same port defined as entered in .codio file

    
        // web server port
        port: 8080,
 

## Capture the browser manually on the local machine

You can use your local browser.

- Either:

    - Open a Terminal window and enter

            $ karma start --no-browsers
or 
    - Select `Karma Start` from the Run menu (the 2nd from the right button).


- Select `Karma Preview` from the Preview menu (the right-hand button).

- Switch back into your Codio project and either: 

    - Open a new Terminal window and enter

            $ karma run
or 
    - Select `Karma Run` from the Run menu (the 2nd from the right button).

and your test will execute


[Codio]: https://codio.com
