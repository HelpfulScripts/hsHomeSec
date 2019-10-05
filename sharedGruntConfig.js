const path = require('path');
const fs   = require('fs');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

function hsCamelCase(name) {
    if (name.indexOf('hs') === 0) {
        name = 'hs' + name.slice(2).charAt(0).toUpperCase() + name.slice(3);
    }
    return name;
}

const webpackExternals = {
    fs:             'fs',           // node.fs
    path:           'path',         // node.path
    url:            'url',          // node.url
    http:           'http',         // node.http
    crypto:         'crypto',       // node.crypto
    child_process:  'child_process' // node.child_process
};

module.exports = (grunt, dir, dependencies, type, lib) => {
    const devPath = dir.slice(0, dir.indexOf('/dev/')+5);
    const pkg = grunt.file.readJSON(dir+'/package.json');
    const slash = pkg.name.lastIndexOf('/');
    lib = lib || hsCamelCase(slash<0? pkg.name : pkg.name.slice(slash+1));
    const libPath = lib.toLowerCase();
    console.log(`${devPath} > ${lib}: ${type}`);    

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('@vamship/grunt-typedoc');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('jest');
    grunt.loadNpmTasks('grunt-coveralls');

    //------ Add Doc Tasks
    grunt.registerTask('doc', ['copy:docs', 'typedoc', 'sourceCode', 'copy:docs2NPM']);

    //------ Add Staging Tasks
    grunt.registerTask('stage', [`${(type === 'app')? 'copy:app2NPM': 'copy:lib2NPM'}`]);
    
    //------ Add Test Tasks
    grunt.registerTask('ospec', () => { require('child_process').spawnSync('./node_modules/.bin/ospec', {stdio: 'inherit'}); });
    grunt.registerTask('jest',  () => { require('child_process').spawnSync('./node_modules/.bin/jest',  ['-c=jest.config.json', '-i'], {stdio: 'inherit'}); });
    grunt.registerTask('test', ['clean:cov', 'jest', 'copy:coverage', 'cleanupCoverage']); 
    
    //------ Support Tasks
    grunt.registerTask('build-html',    ['copy:buildHTML']);
    grunt.registerTask('build-css',     ['less']);
    // grunt.registerTask('build-example', ['clean:example', 'copy:example', 'ts:example', 'less:example', 'webpack:exampleDev']);
    grunt.registerTask('build-js',      ['tslint:src', 'ts:src']);
    // grunt.registerTask('build-spec',    ['tslint:spec', 'ts:test']);    
    grunt.registerTask('build-base',    ['clean:dist', 'clean:docs', 'build-html', 'build-css', 'copy:bin', 'copy:example']);
    grunt.registerTask('buildMin',      (type === 'node')?['build-base', 'build-js', 'doc', 'test', 'coveralls'] : 
                                                          ['build-base', 'build-js', 'webpack:appDev', 'webpack:appProd', 'doc', 'test', 'coveralls']);
    grunt.registerTask('buildDev',      ['build-base', 'build-js', 'webpack:appDev']);

    //------ Entry-point MultiTasks
    grunt.registerTask('default',       ['product']);	
    grunt.registerTask('dev',           ['buildDev', 'stage']);
    grunt.registerTask('product',       ['buildMin', 'stage']);	
    // grunt.registerTask('travis',        ['build-base', 'build-js', (type === 'node')?'':'webpack:appProd', 'test']); // exlude node-apps from webPack to avoid webpack error
    grunt.registerTask('travis',        ['build-base', 'build-js', 'test']); // exlude node-apps from webPack to avoid webpack error
    grunt.registerTask('help',          ['h']);	

    grunt.registerMultiTask('sourceCode', translateSourcesToHTML);  
    grunt.registerMultiTask('cleanupCoverage', removeTimestampFromCoverage);  

    //------ Add general help 
    grunt.registerTask('h', 'help on grunt options', () => {
        grunt.log.writeln(`  grunt: \t make once, don't watch`);
        grunt.log.writeln(`  grunt watch: \t watch for changes, don't make yet`);
        grunt.log.writeln(`  grunt make: \t build, test, doc, and stage`);
        grunt.log.writeln(`  grunt product: make optimized, don't watch; relevant for apps only`);
    }); 	

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
			dist:   ['bin'],
            docs:   ['docs'],
            cov:    ['_coverage']
        },
        copy: {
            buildHTML:  { expand:true, cwd:'src/', 
                src:['*.html', '*.json'], dest:'bin/' 
            },
            bin:{ files: [
                { expand:true, cwd: 'src/bin',              // if present, scaffolding for bin distribution
                    src:['**/*', '!**/*.ts'], dest:'bin' 
                },
                { expand:true, cwd: './',                   // readme and package.json
                    src:['*.md', 'package.json'], dest:'bin' 
                }
            ]},
            // create docs/html files
            docs: { files: [
                { expand:true, cwd: devPath+'/local/',  // default docs index.html from 'local' admin project 
                    src:['index*.html'], dest:'docs' 
                },
                { expand:true, cwd: './src/docs',       // project-specific docs index*.html
                    src:['index*.html'], dest:'docs' 
                },
                { expand:true, cwd: './',               // project-specific docs css files
                    src:[`${lib}.css*`], dest:'docs' 
                },
                { expand:true, cwd: './bin',            // project-specific docs files: libraries and configurations (*.json)
                    src:[`${lib}.js`, `${lib}.min.js`, `*.json`], dest:'docs' 
                }
            ]},
            example:{ expand:true, cwd: 'src/example', 
                src:['**/*', '!**/*.ts'], dest:'docs/example' 
            },
            coverage: {files: [
                { expand:true, cwd: '_coverage',            // copy coverage into docs
                    src:['**/*'], dest:`docs/data/src/${lib}/coverage` },
                { expand:true, cwd: '_coverage',            // copy dummy file to docs/data/src to avoid 'src/lib' entry in github
                    src:['lcov.info'], dest:`docs/data/src` },
            ]},
            lib2NPM: { files: [
                { expand:true, cwd: 'bin',                  // copy everything from bin
                    src:['**/*'], dest:`node_modules/${libPath}/` },
                { expand:true, cwd: './',                  // copy css and map
                    src:['*.css*'], dest:`node_modules/${libPath}/` },
            ]},
            app2NPM: { files: [ 
                { expand:true, cwd: 'bin',                  // copy everything from bin
                    src:['**/*'], dest:`node_modules/${libPath}/` },
                { expand:true, cwd: 'bin',                  // copy everything from bin
                    src:[`**/${lib}.*`], dest:`docs` },
                { expand:true, cwd: devPath+'/staging/',    // index.html
                    src:['index.html'], dest:`node_modules/${libPath}/` }
            ]},
            docs2NPM:   { files: [                      // copy the module's docs to npm  
                { expand:true, cwd: 'docs', 
                    src:['**/*'], dest:`node_modules/${libPath}/docs`}
            ]}
        },
        less: {
            options: {
                sourceMap: true
            },
            css: {
                files: [{
                    cwd: './', src: './src/css/<%= pkg.name %>.less', dest: './bin/<%= lib %>.css'
                }]
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
                outDir:     "bin",
                src: ["src/**/*.ts", "!src/**/*.spec.ts", "!src/**/*.jest.ts", "!src/example/*.ts"],
            },
            example : {
                outDir:     "docs/example",
                src: ["src/example/*.ts"],
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
                entry: './bin/index.js',
                output: {
                    filename: `${lib}.min.js`,
                    // chunkFilename: '[name].bundle.js',
                    path: path.resolve(dir, './bin'),
                    library: lib,
                    libraryTarget: "this"
                },
                externals: webpackExternals,
                plugins: [
                    new TerserPlugin({terserOptions: {
                        ecma: 6,
                        module: true,
                        mangle: false
                    },
                    parallel: true
                })
                    // new UglifyJsPlugin({
                    //     uglifyOptions: {
                    //         ecma: 6,
                    //         mangle:false
                    //     }
                    // })
                ]
            },
            appDev: {
                mode: 'development',
                entry: './bin/index.js',
                devtool: "inline-source-map",
                output: {
                    filename: `${lib}.js`,
                    path: path.resolve(dir, './bin'),
                    library: lib,
                    libraryTarget: "this"
                },
                externals: webpackExternals,
            // },
            // test: {
            //     entry: './bin/index.js',
            //     output: {
            //         filename: `${lib}.js`,
            //         path: path.resolve(dir, './bin')
            //     }
            }
        },
        sourceCode: { 
            main: {  // translate all *.ts files in src *.htmlfilesin doc
                expand: true, 
                cwd: 'src/', 
                src: ['**/*.ts', '!**/*.jest.ts', '!**/*.test.ts', '!**/*.spec.ts'], 
                dest: `docs/data/src/${lib}/`,
                rename: (dest, src) => dest + src.replace('.ts','.html')
            }
        },
        cleanupCoverage: { 
            main: {  // translate all *.ts files in src *.html files in doc
                expand: true, 
                cwd: `docs/data/src/${lib}/coverage`, 
                src: ['**/*.html'],
                dest:''
            }
        },
        coveralls: {
            src: `docs/data/src/${lib}/coverage/lcov.info`,
            options: { force: true }
        },

        watch: {
            dependencies: {
                files: dependencies.map(d => `./node_modules/${d.toLowerCase()}/index.js`),
				tasks: ['dev']
            },
			gruntfile: {
                files: ['Gruntfile.js', __dirname+'/sharedGruntConfig.js'], 
				tasks: ['dev']
			},
			js: {
				files: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.jest.ts', '!src/**/*.less'],
				tasks: ['dev']
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

    function translateSourcesToHTML() {  
        // returns a 4-character, right aligned. line number
        function lineNum(num) { return ('    '+(num)).substr(-4).replace(/( )/g, '&nbsp;'); }
        function wrapLine(line, i) {  
            return `<p id=${i+1} class="line"><span>${lineNum(i+1)}</span>${line}</p>`;
        }
        function quote(content) { return `<quote>${content}</quote>`; }
        function comment(content) { 
            return content
                .split('\n')
                .map(l => `<comment>${l}</comment>`)
                .join('\n');
        }
        function module(content) { return `<module>${content}</module>`; }
        function processFile(srcFile, destDir) {
            let i = srcFile.lastIndexOf('/');
            let file = (i>=0)? srcFile.slice(i+1) : srcFile;
            let content = grunt.file.read(srcFile)
                .replace(/( )/g, '&nbsp;')              // preserve whitespaces
                .replace(/(\/\/.*?)<\/code>/g, comment) // color code // comments
                .replace(/\/\/.*?\n/g, comment)         // color code // comments
                .replace(/\/\*[\s\S]*?\*\//g, comment)  // color code /*...*/ comments
                .replace(/'[^']*?'/g, quote)            // color code '...' strings 
                .replace(/"[^"]*?"/g, quote)            // color code "..." strings 
                .split('\n')                            // array of lines
                .map(wrapLine)                          // wrap each line into some formatting
                .join('\n')                             // join lines into a complete string
                ;
            grunt.log.writeln(`   ${srcFile} --> ${destDir}`);    
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
            p { margin:0; padding:0; }
            br  { margin:0; padding:0; }
            .line { 
                white-space: nowrap;
                height:16px; 
            }
            .line>span { 
                display:inline-block; background-color:#eef; height:100%; 
                margin: 0 5px 0 0; padding-right: 5px; color:#999;   
            }
            comment {color: #080;} module {color: #804;} 
            quote {color: #008;} comment>quote {color: #080;}
            .listing { margin: 10px; border: 1px solid #ccc; 
                    font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                    font-size: 14px;  
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
        const replaceFooter = content => content.replace(/<div class='footer[\s\S]*?<\/div>/, '');
        const addLibName    = content => content.replace(/All files/g, `${lib}: All files`);

        this.files.map(f => {
            let content = ''+fs.readFileSync(f.src[0]);
            // console.log(`${lib}: ${f.src[0]}`);
            content = replaceFooter(content);
            content = addLibName(content);
            fs.writeFileSync(f.src[0], content);
        });
        console.log(`cleaned ${this.files.length} files`);
        }

    function writeIndexJson() {
        grunt.file.write('docs/data/index.json', `{"docs": ["${lib}.json"], "title": "HS Libraries"}`);
    }
};
