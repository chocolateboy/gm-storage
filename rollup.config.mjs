import terser  from '@rollup/plugin-terser'
import esbuild from 'rollup-plugin-esbuild'
import size    from 'rollup-plugin-filesize'
import pkg     from './package.json' with { type: 'json' }

const ENTRY = './src/index.ts'
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
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: isDev,
    },
}

const esm = {
    input: ENTRY,
    plugins: [$esbuild],
    output: {
        banner,
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: isDev,
    }
}

const bundle = {
    input: ENTRY,
    plugins: [$esbuild],
    output: [
        {
            banner,
            file: 'dist/index.umd.js',
            format: 'umd',
            name: UMD_NAME,
        },
        {
            banner,
            file: 'dist/index.umd.min.js',
            format: 'umd',
            name: UMD_NAME,
            plugins: [$terser, $size],
            sourcemap: isDev,
        },
    ]
}

const config = isDev ? [cjs] : [cjs, esm, bundle]

export default config
