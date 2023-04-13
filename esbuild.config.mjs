import { filesFromFolder } from 'files-folder';
import * as esbuild from 'esbuild';

esbuild
    .build({
        entryPoints: filesFromFolder('src'),
        bundle: false,
        minify: false,
        sourcemap: true,
        target: 'node18',
        define: { 'require.resolve': undefined },
        platform: 'node',
        splitting: false,
        format: 'cjs',
        allowOverwrite: true,
        outdir: './dist',
    })
    .catch((error) => {
        process.exit(1);
    });
