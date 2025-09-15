// import React, { useState } from 'react';
// import { Document, Page } from 'react-pdf';
// import { pdfjs } from 'react-pdf';

// // PDF worker configuration
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString();

// function PDFViewer() {
//   const [numPages, setNumPages] = useState(0);
//   const [pageNumber, setPageNumber] = useState(1);

//   function onDocumentLoadSuccess({ numPages }) {
//     setNumPages(numPages);
//   }

//   function changePage(offset) {
//     setPageNumber((prevPage) => Math.min(Math.max(prevPage + offset, 1), numPages));
//   }

//   return (
//     <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
//       <div className="mb-5 flex gap-5 items-center">
//         <button
//           onClick={() => changePage(-1)}
//           disabled={pageNumber <= 1}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//         >
//           Previous
//         </button>

//         <span className="text-gray-700 font-medium">
//           Page {pageNumber} of {numPages}
//         </span>

//         <button
//           onClick={() => changePage(1)}
//           disabled={pageNumber >= numPages}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//         >
//           Next
//         </button>
//       </div>

//       <div className="shadow-lg mb-5 bg-white w-[90vw] max-w-[800px]">
//         <Document
//           file="https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0163477&type=printable"
//           onLoadSuccess={onDocumentLoadSuccess}
//           onLoadError={console.error}
//         >
//           <Page
//             pageNumber={pageNumber}
//             width={Math.min(window.innerWidth * 0.9, 800)}
//             renderAnnotationLayer={false}
//             renderTextLayer={false}
//             className="w-full max-w-[800px]"
//           />
//         </Document>
//       </div>

//       <div className="mt-2 flex items-center">
//         <label htmlFor="pageNumber" className="text-gray-700 mr-2">
//           Go to page:
//         </label>
//         <select
//           id="pageNumber"
//           value={pageNumber}
//           onChange={(e) => setPageNumber(Number(e.target.value))}
//           className="px-2 py-1 rounded border border-gray-300"
//         >
//           {Array.from({ length: numPages }, (_, index) => (
//             <option key={index + 1} value={index + 1}>
//               {index + 1}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// }

// export default PDFViewer;

import React, { useState } from 'react';
 const PDFViewer = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-800">PDF Viewer Coming Soon!</h1>
    </div>
  );
}
export default PDFViewer;