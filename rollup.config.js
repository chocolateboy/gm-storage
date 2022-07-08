import size           from 'rollup-plugin-filesize'
import { terser }     from 'rollup-plugin-terser'
import ts             from 'rollup-plugin-ts'
import minifyPrivates from 'ts-transformer-minify-privates'

const ENTRIES = ['index']
const NAME = 'GMStorage'
const PRESERVE_NAMES = [NAME]

const isDev = process.env.NODE_ENV !== 'production'
const pkg = require('./package.json')

const banner = `/* ${pkg.name} ${pkg.version}. @copyright 2020 ${pkg.author}. @license ${pkg.license} */`
const external = isDev ? ['source-map-support/register'] : []
const tsconfig = config => ({ ...config, allowJs: false, checkJs: false })

const transformers = [
    service => ({
        before: [minifyPrivates(service.program)]
    })
]

const $size = size({ showMinifiedSize: false })

const $ts = ts({
    transpiler: 'babel',
    tsconfig,
    babelConfig: {
        plugins: isDev ? ['source-map-support'] : [],
    }
})

const $tsMin = ts({
    transformers,
    transpiler: {
        typescriptSyntax: 'typescript',
        otherSyntax: 'babel'
    },

    tsconfig,
})

const $terser = terser({
    ecma: 2015,
    compress: {
        passes: 2,
    },
    mangle: {
        properties: {
            regex: /^_private_/
        },
        reserved: PRESERVE_NAMES,
    },
})

const cjs = ENTRIES.map(name => ({
    input: `src/${name}.ts`,
    plugins: [$ts],
    external,
    output: {
        file: `dist/${name}.js`,
        format: 'cjs',
        sourcemap: isDev,
        banner,
    },
}))

const release = ENTRIES.map(name => ({
    input: `src/${name}.ts`,
    plugins: [$ts],
    output: [
        {
            file: `dist/${name}.esm.js`,
            format: 'esm',
            banner,
        },
        {
            file: `dist/${name}.umd.js`,
            format: 'umd',
            name: NAME,
            banner,
        },
    ]
}))

const minified = ENTRIES.map(name => ({
    input: `src/${name}.ts`,
    plugins: [$tsMin],
    output: [
        {
            file: `dist/${name}.umd.min.js`,
            format: 'umd',
            name: NAME,
            plugins: [$terser, $size],
            banner,
        },

        // this is just for information: it's not packaged
        {
            file: `dist/data/${name}.esm.min.js`,
            format: 'esm',
            plugins: [$terser, $size],
        }
    ]
}))

const config = isDev ? cjs : [...cjs, ...release, ...minified]

export default config
