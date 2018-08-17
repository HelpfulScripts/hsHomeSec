hsHomeSec 
========
[![npm version](https://badge.fury.io/js/hshomesec.svg)](https://badge.fury.io/js/hshomesec)
[![Build Status](https://travis-ci.org/HelpfulScripts/hsHomeSec.svg?branch=master)](https://travis-ci.org/HelpfulScripts/hsHomeSec)
[![Coverage Status](https://coveralls.io/repos/github/HelpfulScripts/hsHomeSec/badge.svg?branch=master)](https://coveralls.io/github/HelpfulScripts/hsHomeSec?branch=master)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](https://gruntjs.com/) 
[![NPM License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://www.npmjs.com/package/hshomesec)

Helpful Scripts simple home security system.

# Home Security System
A simple homebrew alarm system for OSX High Sierra

Written in [Typescript](typescriptlang.org) to run on [Node](nodejs.org).
- supports cameras with built-in web api. Currently tested
    - WansView Q3S, K3
    - Foscam C1
- creates its own ftp server and configures devices to send snapshots and videos there
- communicates with users via email and OSX services Messages, and Facetime 
- simple and universal UI: receives remote user commands via email

See [documentation for more details](http://helpfulscripts.github.io/hsHomeSec/#!/api/hsHomeSec/0)

## Installation
1. Inside your `~/Documents` folder, create a `homeses` folder and move there:<br>
`> mkdir homeSec`<br>
`> cd homeSec`<br>
   > if you choose a different installation folder, be sure to update the Applescript file `respondToMailAs.scpt` below.
2. Cone the project:<br>
`> npm i hshomesec`<br>

## Setup
1. Move to the installation folder:<br>
`> cd node_modules/hshomesec`
2. create homeCfg.json from the template:<br>
    `> cp src/config/homeCfg-template.json src/config/homeCfg.json`
3. configure homeCfg.json with server IPs and available cameras
   - *hint*: it may be a good idea to also configure your DHCP server to assign fixed addresses to the computer running the homeSec server, as well as to connected devices.
4. Optional: Setup your Mac as follows
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
- From `~/Documents/homeSec`, call<br>
    `> sudo node node_modules/.bin/hsHomeSec`<br>
    to start the system without starting an ftp server
- Or call<br>
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
