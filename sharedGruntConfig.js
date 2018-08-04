const path = require('path');
const fs   = require('fs');
// const webpack = require("webpack");
//const webpackConfig = require('./webpack.config');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

function hsCamelCase(name) {
    if (name.indexOf('hs') === 0) {
        name = 'hs' + name.slice(2).charAt(0).toUpperCase() + name.slice(3);
    }
    return name;
}

module.exports = (grunt, dir, dependencies, type) => {
    const devPath = dir.slice(0, dir.indexOf('/dev/')+5);
    const pkg = grunt.file.readJSON(dir+'/package.json');
    const slash = pkg.name.lastIndexOf('/');
    const lib = hsCamelCase(slash<0? pkg.name : pkg.name.slice(slash+1));
    const libPath = lib.toLowerCase();
    console.log(`${devPath} > ${lib}: ${type}`);    

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-typedoc');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('jest');

    //------ Add Doc Tasks
    grunt.registerTask('doc', ['clean:docs', 'copy:htmlGH', 'typedoc', 'sourceCode', 'copy:docs2NPM']);

    //------ Add Staging Tasks
    grunt.registerTask('stage', [`${(type === 'app')? 'copy:app2NPM': 'copy:lib2NPM'}`]);
    
    //------ Add Test Tasks
    grunt.registerTask('ospec', () => { require('child_process').spawnSync('./node_modules/.bin/ospec', {stdio: 'inherit'}); });
    grunt.registerTask('jest',  () => { require('child_process').spawnSync('./node_modules/.bin/jest',  ['-c=jest.config.json'], {stdio: 'inherit'}); });
    grunt.registerTask('test', ['clean:test', /*'copy:test', 'build-spec', 'ospec',*/ 'jest', 'cleanupCoverage']); 
    
    //------ Add Build Tasks
    grunt.registerTask('build-html',    ['copy:buildHTML']);
    grunt.registerTask('build-css',     ['less']);
    grunt.registerTask('build-example', ['clean:example', 'copy:example', 'ts:example', 'less:example', 'webpack:exampleDev']);
    grunt.registerTask('build-js',      ['tslint:src', 'ts:src']);
    grunt.registerTask('build-jsMin',   ['ts:srcMin']);
    grunt.registerTask('build-spec',    ['tslint:spec', 'ts:test']);    

    registerBuildTasks(type);
   
    //------ Add other MultiTasks
    grunt.registerTask('make',      ['build', 'doc', 'test', 'stage']);
    grunt.registerTask('makeShort', ['build', 'stage']);
    grunt.registerTask('once',      ['make']);	
    grunt.registerTask('default',   ['watch']);	
    grunt.registerTask('product',   ['buildMin', 'doc', 'stage']);	
    grunt.registerTask('travis',    ['build', 'test']);	

    grunt.registerMultiTask('sourceCode', translateSources);  
    grunt.registerMultiTask('cleanupCoverage', removeTimestampFromCoverage);  

    //------ Add general help 
    grunt.registerTask('h', 'help on grunt options', printHelp); 	

    //------ Add post to gh-pages 
    grunt.registerTask('ghpages', 'Github post to gh-pages', publish_gh); 	
  
    //------ Add Task Configurations
    return {
        pkg: grunt.file.readJSON(dir+'/package.json'),
        lib: lib,
        libPath: grunt.config.process(lib).toLowerCase(),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        clean: {
			dist:    ['_dist'],
            docs:   ['docs'],
            test:   ['_dist/tests'],
            example:['_dist/example']
        },
        copy: {
            buildHTML:  { expand:true, cwd:'src/', 
                src:['*.html'], dest:'_dist/' 
            },
            bin:{ files: [
                { expand:true, cwd: 'src/bin',  // if present, scaffolding for bin distribution
                    src:['**/*', '!**/*.ts'], dest:'_dist' 
                },
                { expand:true, cwd: './',       // readme and package.json
                    src:['*.md', 'package.json'], dest:'_dist' 
                }
            ]},
            htmlGH: { files: [
                { expand:true, cwd: devPath,    // index.html and indexGH.html
                    src:['index.html', 'indexGH.html'], dest:'docs' 
                }
            ]},
            example:{ expand:true, cwd: 'src/example', 
                src:['**/*', '!**/*.ts'], dest:'docs/example' 
            },
            libStage: { files: [
                // { expand:true, cwd: '_dist/',        // copy everything from _dist/src to _dist
                //     src:['**/*'], dest:'_dist' }
            ]},
            lib2NPM: { files: [
                { expand:true, cwd: '_dist',        // copy everything from _dist
                    src:['**/*'], dest:`node_modules/${libPath}/` },
                { expand:true, cwd: 'docs/data',         // copy source htmls to hsDocs
                    src:['**/*', '!index.json'], dest:`${devPath}/hsApps/hsDocs/docs/data` }
            ]},
            app2NPM: { files: [ 
                { expand:true, cwd: '_dist',        // copy everything from _dist
                    src:['**/*'], dest:`node_modules/${libPath}/` },
                { expand:true, cwd: '_dist',        // copy everything from _dist
                    src:['**/*', '!package.json'], dest:`docs` },
                { expand:true, cwd: devPath,            // index.html and indexGH.html
                    src:['index.html', 'indexGH.html'], dest:`node_modules/${libPath}/` }
            ]},
            docs2NPM:   { files: [                      // copy the module's docs to npm  
                { expand:true, cwd: 'docs', 
                    src:['**/*'], dest:`node_modules/${libPath}/docs`}
            ]},
		    test: { files: [
                { expand:true, cwd:'_dist/',    
                    src:['*.js', '*.css', '*.html'], dest:'_dist/tests/'
                },
                { cwd:'example/', expand:true, 
                    src:['*.json'], dest:'_dist/tests/'}
            ]}
        },
        less: {
            options: {
                sourceMap: true
            },
            css: {
                files: {
                    '_dist/<%= lib %>.css': 'src/css/<%= pkg.name %>.less'
                }
            },
            example: {
                files: {
                    'docs/example/<%= pkg.name %>.css': `src/example/${libPath}.less`
                }
            }
        },
        tslint: {
            options: {
                configuration: __dirname+'/tslint.json',
                force:  false,
                fix:    false
            },
            src: {
                src: ["src/**/*.ts"]
            },
            spec: {
                src: ["src/**/*.spec.ts", "src/**/*.jest.ts"]
            }
        },
        ts: {
            options: {
                target: "es6",
                module: "CommonJS",
                rootDir: "./src",
                moduleResolution: "node",
                inlineSourceMap: true,
                removeComments: true,
                noImplicitAny: true,
                declaration: true,
                suppressImplicitAnyIndexErrors: true
            },
            src : {
                outDir:     "_dist",
                src: ["src/**/*.ts", "!src/**/*.spec.ts", "!src/**/*.jest.ts", "!src/example/*.ts"],
            },
            srcMin : {
                outDir:     "_dist",
                src: ["src/**/*.ts", "!src/**/*.spec.ts", "!src/**/*.jest.ts", "!src/example/*.ts"],
            },
            example : {
                outDir:     "docs/example",
                src: ["src/example/*.ts"],
            },
            test : {
                options: {
                    allowJs: true,
                    declaration: false,
                    rootDir: "./"
                },
                outDir:     "_dist/tests",
                src: ["src/**/*.spec.ts"],
            }
        },
        typedoc: { 
            code: {
                options: {
                    target: 'es6',
                    module: 'commonjs',
                    moduleResolution: "node",
                    json:   `docs/data/${lib}.json`,
                    mode:   'modules',
                    name:   `${lib}`,
                },
                src: ['src/**/*.ts', '!src/**/*.*.ts', '!src/example/**/*'] // no specs, no example
            }
        },
        webpack: {
            options: {
                stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
            },
            appProd: { 
                mode: 'production',
                entry: './_dist/index.js',
                output: {
                    filename: `${lib}.min.js`,
                    chunkFilename: '[name].bundle.js',
                    path: path.resolve(dir, './_dist')
                },
                plugins: [
                    new UglifyJsPlugin({
                        uglifyOptions: {
                            ecma: 6,
                            mangle:false
                        }
                    })
                ]
            },
            appDev: {
                mode: 'development',
                entry: './_dist/index.js',
                devtool: "inline-source-map",
                output: {
                    filename: `${lib}.js`,
                    path: path.resolve(dir, './_dist')
                }
            },
            test: {
                entry: './_dist/index.js',
                output: {
                    filename: `${lib}.js`,
                    path: path.resolve(dir, './_dist')
                }
            }
        },
        sourceCode: { 
            main: {  // translate all *.ts files in src *.htmlfilesin doc
                expand: true, 
                cwd: 'src/', 
                src: ['**/*.ts', '!**/*.jest.ts', '!**/*.test.ts', '!**/*.spec.ts'], 
                dest: `docs/data/src/${lib}/`,
                rename: (dest, src) => dest + src.slice(src.lastIndexOf('/')+1).replace('.ts','.html')
            }
        },
        cleanupCoverage: { 
            main: {  // translate all *.ts files in src *.htmlfilesin doc
                expand: true, 
                cwd: 'docs/coverage', 
                src: ['**/*.html'],
                dest:''
            }
        },

        watch: {
            dependencies: {
                files: dependencies.map(d => `./node_modules/${d.toLowerCase()}/index.js`),
				tasks: ['make']
            },
			gruntfile: {
                files: ['Gruntfile.js', __dirname+'/sharedGruntConfig.js'], 
				tasks: ['make']
			},
			js: {
				files: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.jest.ts', '!src/**/*.less'],
				tasks: ['makeShort']
			},
			less: {
				files: ['src/**/*.less'],
				tasks: ['build-css', 'stage']
			},
			html: {
				files: ['src/**/*.html'],
				tasks: ['build-html', 'stage']
			},
			specs: {
				files: ['src/**/*.spec.ts'],
				tasks: ['test']
			},
			jest: {
				files: ['src/**/*.jest.ts'],
				tasks: ['jest']
			}
		}
    }

    function registerBuildTasks(type) { 
        let buildTasks = ['clean:dist', 'build-html', 'build-css', /*'build-example',*/ 'copy:bin', 'copy:example'];
        let buildProduct;
        switch (type) {
            case 'app':     buildProduct = buildTasks.concat(['build-jsMin', 'webpack:appProd']);
                            buildTasks   = buildTasks.concat(['build-js', 'webpack:appDev', 'webpack:appProd']); 
                            break;
            case 'node': 
            case 'util':    
            case 'lib': 
            default:        buildProduct = buildTasks.concat(['build-jsMin', 'copy:libStage']);
                            buildTasks   = buildTasks.concat(['build-js', 'copy:libStage']); 
                            break;
        }
        grunt.registerTask('build', buildTasks);
        grunt.registerTask('buildMin', buildProduct);
    }

    function printHelp() {
        grunt.log.writeln(`  grunt: \t make, then watch`);
        grunt.log.writeln(`  grunt once: \t make only, don't watch`);
        grunt.log.writeln(`  grunt make: \t build, test, doc, and stage`);
        grunt.log.writeln(`  grunt product: make optimized, don't watch; relevant for apps only`);
    }

    function translateSources() {  
        // returns a 4-character, right aligned. line number
        function lineNum(num) { return ('    '+(num)).substr(-4).replace(/( )/g, '&nbsp;'); }
//        function destFile(file, destDir) { return destDir+file.replace('.ts', '.html'); }
        function wrapLine(line, i) {  
            return `<span id=${i+1} class="line">${lineNum(i+1)}</span>${line}<br>`;
        }
        function comment(content) { return `<comment>${content}</comment>`; }
        function module(content) { return `<module>${content}</module>`; }
        function processFile(srcFile, destDir) {
            let i = srcFile.lastIndexOf('/');
            let file = (i>=0)? srcFile.slice(i+1) : srcFile;
            let content = grunt.file.read(srcFile)
                .replace(/( )/g, '&nbsp;')              // preserve whitespaces
                .split('\n')                            // array of lines
                .map(wrapLine)                          // wrap each line into some formatting
                .join('\n')                             // join lines into a complete string
                .replace(/(\/\/.*?)<\/code>/g, comment) // color code some syntax
                .replace(/\/\*[\s\S]*?\*\//g, comment) // color code some syntax
                ;
            grunt.file.write(destDir, `
                ${intro}
                <h1>${file}</h1>
                <div class='listing'><code>${content}</code></div>
                ${extro}
            `);
        }

        const style = `
            body { overflow:hidden;}
            h1 { font-family: Arial, sans-serif; font-size: 24px; color: #44a; }
            p { margin:0; padding-top:5px; }
            br  { margin:0; padding:0; }
            .line { margin: 0 5px 0 0; padding-right: 5px; color:#999; background-color:#eef;  }
            comment { color: #080;} module { color: #804;}
            .listing { margin: 10px; border: 1px solid #ccc; 
                    font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                    font-size: 14px; line-height: 1.2em; 
                    overflow:scroll;
                    height:90%;
            }
            code { padding: 5px 0;}
        `;
        const intro = `<html><style>${style.trim()}</style></html><body>`;
        const extro = `</body>`;
        let files = this.files;
        files.map(file => processFile(file.src, file.dest));
        writeIndexJson();
        grunt.log.writeln(`converted ${files.length} files`);    
    }

    function removeTimestampFromCoverage() {
        this.files.map(f => {
            let content = ''+fs.readFileSync(f.src[0]);
            console.log(f.src[0]);
            const i = content.indexOf("<div class='footer");
            if (i>0) {
                const j = content.indexOf('</div>', i)+6;
                if (j>i) {
                    content = content.substring(0, i) + '***' + content.substring(j);
                    fs.writeFileSync(f.src[0], content);
                }
            }
        });
    }

    function writeIndexJson() {
        grunt.file.write('docs/data/index.json', `{"docs": ["${lib}.json"], "title": "HS Libraries"}`);
    }

    function publish_gh() {
        grunt.log.writeln(`spawning ${devPath}ghpages-push.sh`);
        var done = this.async();
        grunt.util.spawn({
            cmd: devPath+'ghpages-push.sh',
            args: [dir]
        }, (error, result, code) => {
            grunt.log.writeln(`>> ${result.stdout.replace(/[\n|\r]/g, '\n>> ')}`);
            grunt.log.writeln(`exit code: ${code}, errors:${result.stderr}`);
            done();
        });
    }
};
