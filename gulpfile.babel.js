import { src, dest, watch, series, parallel } from 'gulp';
import yargs from 'yargs';
import sass from 'gulp-sass';
// import cleanCss from 'gulp-clean-css';
import gulpif from 'gulp-if';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer';
import del from 'del';
import webpack from 'webpack-stream';
import named from 'vinyl-named';
import browserSync from "browser-sync";
import info from "./package.json";
import replace from "gulp-replace";
import config from "./config.json";
// import wpPot from "gulp-wp-pot";
const PRODUCTION = yargs.argv.prod;
const server = browserSync.create();

// Plugins
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');


export const serve = done => {
  server.init({
    proxy: config.browserSync.proxy,
    https: config.browserSync.https,
    port: config.browserSync.port
  });
  done();
};
export const reload = done => {
  server.reload();
  done();
};
export const clean = () => del(['dist']);
  
export const styles = () => {
return src(['src/scss/bundle.scss', 'src/scss/admin.scss'])
  .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
  .pipe(sass().on('error', sass.logError))
  .pipe(gulpif(PRODUCTION, postcss([ autoprefixer ])))
  .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
  .pipe(dest('dist/css', {overwrite: true}))
  .pipe(server.stream());
}
export const images = () => {
return src('src/images/**/*.{jpg,jpeg,png,svg,gif,ico}')
  .pipe(dest('dist/images'));
}
export const copy = () => {
  return src(['src/**/*','!src/{images,js,scss}','!src/{images,js,scss}/**/*'])
  .pipe(dest('dist'));
}
// export const wpPlugin = () => {
  
//   return src(['waves-display.php'])
//     .pipe( replace( /(Version:\s+[0-9]+.[0-9]+.)([0-9]+)/g, function( match, p1, p2 ) {
//       // console.log( match );
//       // console.log( p1 );
//       // console.log( p2 );
//       let inc = parseInt( p2 ) + 1;
//       console.log( p1 + inc.toString() );
//       return p1 + inc.toString();
//     } ) )
//     .pipe(dest(''));
// }
export const scripts = () => {
  return src(['src/js/bundle.js','src/js/admin.js'])
  .pipe(named())
  .pipe(webpack({
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: []
            }
          }
        }
      ]
    },
    mode: PRODUCTION ? 'production' : 'development',
    // devtool: !PRODUCTION ? 'inline-source-map' : false,
    output: {
      filename: '[name].js'
    },
    externals: {
      jquery: 'jQuery'
    },
    plugins: [
      new MomentLocalesPlugin()
      // new BundleAnalyzerPlugin({ 
      //   analyzerMode: 'static',
      //   analyzerHost: "192.168.8.200",
      //   analyzerPort: 8880
      // })
    ]
  }))
  .pipe(dest('dist/js'));
}
// .pipe( replace( /(Version:\s+[0-9]+.[0-9]+.)([0-9]+)/g, ( p1, p2, p3 ) => p2 + ( parseInt( p3 ) + 1 )  ))
export const themeify = () => {
  return src([
    "**/*",
    "!node_modules{,/**}",
    "!bundled{,/**}",
    "!src{,/**}",
    "!.babelrc",
    "!.gitignore",
    "!gulpfile.babel.js",
    "!package.json",
    "!package-lock.json",
    "!stats.json",
    "!README.md",
    "!.DS_Store"
  ])
  .pipe(replace("_themename", info.theme_name))
  .pipe(replace("_themedescription", info.description))
  // .pipe(replace("Version: 1.0.0", "Version: 1.0." + Date.now()))
  // .pipe(replace("1.0.0", "1.0." + Date.now()))
  .pipe(dest(`../${info.name.replace(/_/g, '-')}/`));
};
// export const pot = () => {
//   return src("**/*.php")
//     .pipe(
//       wpPot({
//         domain: "_themename",
//         package: info.name
//       })
//     )
//   .pipe(dest(`languages/${info.name}.pot`));
// };
export const watchForChanges = () => {
  watch('src/scss/**/*.scss', styles);
  watch('src/images/**/*.{jpg,jpeg,png,svg,gif,ico}', series(images, reload));
  watch(['src/**/*','!src/{images,js,scss}','!src/{images,js,scss}/**/*'], series(copy, reload));
  watch('src/js/**/*.js', series(scripts, reload));
  watch("**/*.php", reload);
} 
export const dev = series(clean, parallel(styles, images, copy, scripts), serve, watchForChanges);
export const build = series(clean, parallel(styles, images, copy, scripts));
export default dev;