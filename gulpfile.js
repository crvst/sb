var lr = require('tiny-lr'),
    connect = require('connect'),
    livereload = require('gulp-livereload'),
    serveStatic = require('serve-static'),
    server = lr(),
    pngquant = require('imagemin-pngquant'),

    gulp = require('gulp'),

    colors = require('colors'),
    csso = require('gulp-csso'),
    changed = require('gulp-changed'),
    gzip = require('gulp-gzip'),
    imagemin = require('gulp-imagemin'),
    jade = require('gulp-jade'),
    please = require('gulp-pleeease'),
    plumber = require('gulp-plumber'),
    react = require('gulp-react'),
    rigger = require('gulp-rigger'),
    sass = require('gulp-sass'),
    stripDebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify');

var base = {
    port: 9999,
    src: 'src/',
    assets: 'src/assets/',
    public: 'public/',
    dest: 'public/assets/',
    bower: 'bower_components/'
};

var path = {
    stylesheets: {
        src: base.assets + 'stylesheets/*.scss',
        dest: base.dest + 'stylesheets/'
    },

    images: {
        src: base.assets + 'images/**/*',
        dest: base.dest + 'images/'
    },

    scripts: {
        src: base.assets + 'scripts/*.js',
        dest: base.dest + 'scripts/'
    },

    jade: {
        src: base.src + '/*.jade',
        dest: base.public
    },

    fonts: {
        src: base.assets + 'fonts/**/*',
        dest: base.dest + 'fonts/'
    },

    content: {
        src: base.src + 'content/**/*',
        dest: base.public + 'content/'
    },

    temp: {
        src: base.src + 'temp/**/*',
        dest: base.public + 'temp/'
    }
};

gulp.task('sass', function () {
    gulp.src(path.stylesheets.src)
        .pipe(plumber())
        .pipe(changed(path.stylesheets.src))
        .pipe(sass({
            precision: 5,
            sourceComments: false,
            sourcemap: false
        }))
        .pipe(please({
            'autoprefixer': {
                browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'ie 8'],
                cascade: true
            },
            'filters': {'oldIE': false},
            'rem': ["15px"],
            'pseudoElements': true,
            'opacity': true,
            'import': true,
            'minifier': false,
            'mqpacker': true,
            'next': false
        }))
        //.pipe(csso())
        .pipe(gulp.dest(path.stylesheets.dest))
        .pipe(gzip())
        .pipe(gulp.dest(path.stylesheets.dest))
        .on('error', console.log)
        .pipe(livereload(server));
});

gulp.task('jade', function () {
    gulp.src(path.jade.src)
        .pipe(plumber())
        .pipe(changed(path.jade.src))
        .pipe(jade({
            pretty: true
        }))
        .on('error', console.log)
        .pipe(gulp.dest(path.jade.dest))
        .pipe(livereload(server));
});

gulp.task('scripts', function () {
    gulp.src(path.scripts.src)
        .pipe(plumber())
        .pipe(changed(path.scripts.src))
        .pipe(react())
        .pipe(rigger())
        .pipe(stripDebug())
        //.pipe(uglify())
        .pipe(gulp.dest(path.scripts.dest))
        .pipe(gzip())
        .pipe(gulp.dest(path.scripts.dest))
        .pipe(livereload(server));
});

gulp.task('images', function () {
    gulp.src(path.images.src)
        .pipe(changed(path.images.src))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: true}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.images.dest))
        .pipe(livereload(server));
});

gulp.task('icons', function () {
    gulp.src([base.src + '*.ico', base.src + '*.png'])
        .pipe(gulp.dest(base.public))
});

gulp.task('fonts', function () {
    gulp.src(path.fonts.src)
        .pipe(changed(path.fonts.src))
        .pipe(gulp.dest(path.fonts.dest))
        .pipe(livereload(server));
});

gulp.task('content', function () {
    gulp.src(path.content.src)
        .pipe(gulp.dest(path.content.dest))
        .pipe(livereload(server));
});

gulp.task('temp', function () {
    gulp.src(path.temp.src)
        .pipe(gulp.dest(path.temp.dest))
        .pipe(livereload(server));
});

gulp.task('bower', function () {
    gulp.src(base.bower + '/**/*')
        .pipe(gulp.dest('./public/bower_components'));
});

gulp.task('server', function () {
    connect()
        .use(require('connect-livereload')())
        .use(serveStatic(base.public))
        .listen(base.port);
});

gulp.task('default', function () {

    gulp.start('sass', 'jade', 'images', 'icons', 'fonts', 'scripts', 'content', 'temp', 'bower', 'server');

    server.listen(35729, function (err) {
        if (err) return console.log(err);

        gulp.watch('src/assets/stylesheets/**/*.scss', function () {
            gulp.run('sass');
        });
        gulp.watch(['src/*.jade', 'src/templates/partials/*.jade', 'src/templates/mixins/*.jade', 'src/templates/layouts/*.jade', 'src/templates/app/*.jade'], function () {
            gulp.run('jade');
        });
        gulp.watch('src/assets/images/**/*', function () {
            gulp.run('images');
        });
        gulp.watch('src/assets/scripts/**/*', function () {
            gulp.run('scripts');
        });

        console.log(colors.bgYellow.black('Listen at http://localhost:' + base.port));
    });
});
