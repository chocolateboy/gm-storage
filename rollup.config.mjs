import terser  from '@rollup/plugin-terser'
import esbuild from 'rollup-plugin-esbuild'
import size    from 'rollup-plugin-filesize'
import pkg     from './package.json' with { type: 'json' }

const ENTRY = './src/index.ts'
const MINIFY = ['gm-storage', 'json-key-store']
const UMD_NAME = 'GMStorage'
const PRESERVE_NAMES = ['GMStorage', 'GMStorageBase', 'JSONKeyStore']

const isDev = process.env.NODE_ENV !== 'production'
const banner = `/* ${pkg.name} ${pkg.version}. @copyright 2020 ${pkg.author}. @license ${pkg.license} */`

const $size = size({ showMinifiedSize: false })
const $esbuild = esbuild({ target: 'esnext', sourceMap: isDev })

const $terser = terser({
    ecma: 2015,
    compress: {
        passes: 2,
    },
    mangle: {
        reserved: PRESERVE_NAMES,
    },
    toplevel: true,
})

const cjs = {
    input: ENTRY,
    plugins: [$esbuild],
    output: {
        banner,
        dir: 'dist/cjs',
        entryFileNames: '[name].cjs',
        format: 'cjs',
        preserveModules: true,
        sourcemap: isDev,
    },
}

const esm = {
    input: ENTRY,
    plugins: [$esbuild],
    output: {
        banner,
        dir: 'dist/esm',
        entryFileNames: '[name].mjs',
        format: 'esm',
        preserveModules: true,
        sourcemap: isDev,
    }
}

const bundle = {
    input: ENTRY,
    plugins: [$esbuild],
    output: [
        {
            banner,
            file: 'dist/umd/index.umd.js',
            format: 'umd',
            name: UMD_NAME,
        },
        {
            banner,
            file: 'dist/umd/index.umd.min.js',
            format: 'umd',
            name: UMD_NAME,
            plugins: [$terser, $size],
            sourcemap: isDev,
        },
    ]
}

// these are just for information: they're not packaged
const minified = MINIFY.map(name => ({
    input: `src/${name}.ts`,
    plugins: [$esbuild],
    output: {
        file: `dist/data/${name}.esm.min.js`,
        format: 'esm',
        plugins: [$terser, $size],
    }
}))

const config = isDev ? [cjs, ...minified] : [cjs, esm, bundle]

export default config
