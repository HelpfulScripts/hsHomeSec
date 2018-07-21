# Home Security System
A simple homebrew alarm system for OSX High Sierra

Written entirely in [Typescript](typescriptlang.org) to run on [Node](nodejs.org).
- supports cameras with built-in web api. Currently tested
    - WansView Q3S
    - Foscam C1
- creates its own ftp server and configures devices to send snapshots and videos there
- communicates with users via email and OSX services Messages, and Facetime 
- simple and universal UI: receives remote user commands via email

See [documentation for more details](http://helpfulscripts.github.io/hsHomeSec/indexGH.html#!/api/hsHomeSec/0)

## Installation
1. Inside your `~/Documents` folder, clone the project:<br>
`> git clone https://github.com/HelpfulScripts/hsHomeSec.git`<br>
   > if you choose a different installation folder, be sure to update the Applescript file `respondToMailAs.scpt` below.
2. Move there:<br>
`> cd hsHomeSec`
3. And install dependencies:<br>
`> npm i`

## Setup
1. create homeCfg.json from the template:<br>
    `> cp src/config/homeCfg-template.json src/config/homeCfg.json`
2. create a recordings directory:<br>
    `> mkdir recordings`
3. configure homeCfg.json with server IPs and available cameras
   - *hint*: it may be a good idea to also configure your DHCP server to assign fixed addresses to the computer running the homeSec server, as well as to connected devices.
4. configure Mail to communicate with homeSec
   - copy script to mail script folder:<br>`> cp src/osascript/respondToMailAs.scpt                ~/Library/Application\ Scripts/com.apple.mail`.<br>
      (if necessary, first create the `com.apple.mail` folder)
   - on OSX, open Mail and ensure that a valid mail account is active
   - open `Preferences` -> `Rules`, then `Add Rule`
   - give it a desciptive name, such as `talkToHomeSec`
   - configure it as <code>if `any` of the folowing conditions are met: `Every Message` 
    perform the following actions: `Run Applescript`</code> and select `respondToMailAs.scpt` from the popdown
5. Optional: Setup your Mac as follows
    - select `Desktop & Screen Saver`, set `Start after:` to `never`
    - select `Energy Saver`; set `Computer Sleep` to `never`; deselect `Put hard disk to sleep`
    - install voice `Allison`
        - open panel `Accessibility->Speech`; 
        - select `System Voice: Custom` and select `Allison`. Then close. 
        Voice will be downloaded automatically.
    - `Terminal->Preferences->Profiles->Shell`:
        - `When the shell exits: Close the window`
        - `Ask befor closing: Never`

## Run
- Call<br>
    `> sudo node node_modules/.bin/hsHomeSec`<br>
    to start the system without starting an ftp server
- Call<br>
    `> sudo node node_modules/.bin/hsHomeSec ftp`<br>
    to start the system with its own ftp server.
    > You can try the calls without `sudo`, though it is likely needed since we start a webserver (and, if selected, an ftp server). 
    The webserver lets Mail (via Applescript) tell the system about incoming user commands.

## Operations
- send an email to the mail account configured above.
- ensure that the mail address you send it from is configured as `User` in `homeCfg.json`. A `403` error will be returned if not.
- issue commands via the mail's subject field. For example:
   - `snap` will return a snapshot from each attacherd camera
   - `help` will return a list of available commands.
