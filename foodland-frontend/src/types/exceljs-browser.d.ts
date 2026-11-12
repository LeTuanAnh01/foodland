// ExcelJS browser distribution avoids Node-only dependencies in Vite builds.
declare module 'exceljs/dist/exceljs.min.js' {
  import ExcelJS from 'exceljs';
  export default ExcelJS;
}
