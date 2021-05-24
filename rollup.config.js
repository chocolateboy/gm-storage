import size           from 'rollup-plugin-filesize'
import { terser }     from 'rollup-plugin-terser'
import minifyPrivates from 'ts-transformer-properties-rename'
import ts             from '@wessberg/rollup-plugin-ts'

const isDev = process.env.NODE_ENV !== 'production'
const external = isDev ? ['source-map-support/register'] : []

const $size = size({ showMinifiedSize: false })

const transformers = [
    service => ({
        before: [minifyPrivates(service.program, {
            entrySourceFiles: ['./src/index.ts'],
            internalPrefix: '', // don't rename "internal" properties
        })]
    })
]

const $ts = ts({
    transpiler: 'babel',
    babelConfig: {
        plugins: isDev ? ['source-map-support'] : [],
    }
})

const $tsMin = ts({
    transpiler: 'babel',
    transformers,
})

const $terser = terser({
    ecma: 2015,
    compress: {
        passes: 2,
        keep_fnames: true,
    },
    mangle: {
        properties: {
            regex: /^_private_/,
        },
        reserved: ['GMStorage'],
    }
})

const cjs = {
    input: 'src/index.ts',
    plugins: [$ts],
    external,
    output: {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: isDev,
    },
}

const release = [
    {
        input: 'src/index.ts',
        plugins: [$ts],
        output: [
            {
                file: 'dist/index.esm.js',
                format: 'esm',
            },
            {
                file: 'dist/index.umd.js',
                format: 'umd',
                name: 'GMStorage',
            },
        ]
    },
    {
        input: 'src/index.ts',
        plugins: [$tsMin],
        output: [
            {
                file: 'dist/index.umd.min.js',
                format: 'umd',
                name: 'GMStorage',
                plugins: [$terser, $size],
            },

            // this is just for information: it's not packaged
            {
                file: 'dist/data/index.esm.min.js',
                format: 'esm',
                plugins: [$terser, $size],
            }
        ]
    }
]

const config = isDev ? [cjs] : [cjs, ...release]

export default config
