import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  onwarn(warning, warn) {
    if (warning.code === 'EVAL') return;
    warn(warning);
  },
  output: [
    {
      file: 'dist/winlet-local.umd.js',
      format: 'umd',
      name: 'win$',
      sourcemap: true,
    },
    {
      file: 'dist/winlet-local.esm.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    postcss({
      extract: 'winlet-local.min.css',
      minimize: true,
    }),
    terser(),
    copy({
      targets: [
        { src: 'src/*.png', dest: 'dist/' },
        { src: 'src/*.gif', dest: 'dist/' },
      ],
    }),
  ],
};
