import license from 'rollup-plugin-license'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  plugins: [
    license({
      banner: `
        <%= pkg.name %> <%= pkg.version %>
        <%= pkg.description %>
        <%= pkg.homepage %>
        Date: <%= moment().format('YYYY-MM-DD') %>
      `,
    }),
    resolve(),
    babel(),
  ],
  output: [
    {
      file: 'dist/uploadcare.umd.js',
      name: 'uploadcareAPI',
      format: 'umd',
    },
    {
      file: 'dist/uploadcare.esm.js',
      name: 'uploadcareAPI',
      format: 'esm',
    },
  ],
}
