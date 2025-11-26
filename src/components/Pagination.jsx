// import React from 'react';

// const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
//   const { currentPage, totalPages, limit, totalCount } = pagination;

//   // Define available limit options
//   const limitOptions = [5, 10, 20, 50, 100];

//   return (
//     <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
//       {/* Display total results and Limit Selector */}
//       <div className="flex items-center gap-4">
//         <div className="text-sm text-gray-600">
//           Showing {(currentPage - 1) * limit + 1} to{' '}
//           {Math.min(currentPage * limit, totalCount)} of {totalCount} results
//         </div>

//         {/* Limit Selector */}
//         <div className="flex items-center gap-2 text-sm text-gray-600">
//           <span>Items per page:</span>
//           <select
//             value={limit}
//             onChange={(e) => onLimitChange(Number(e.target.value))}
//             className="px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           >
//             {limitOptions.map((option) => (
//               <option key={option} value={option}>
//                 {option}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Pagination Buttons */}
//       <div className="flex items-center gap-2">
//         {/* Previous Button */}
//         <button
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className={`px-3 py-1 rounded-md ${currentPage === 1
//             ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//             : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
//             }`}
//         >
//           Prev
//         </button>

//         {/* Current Page Indicator */}
//         <button className="px-3 py-1 rounded-md bg-blue-500 text-white cursor-default">
//           {currentPage}
//         </button>

//         {/* Next Button */}
//         <button
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage === totalPages || totalPages === 0}
//           className={`px-3 py-1 rounded-md ${currentPage === totalPages || totalPages === 0
//             ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//             : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
//             }`}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Pagination;











import React from 'react';

// Helper to generate page numbers with ellipsis
function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }
  return pages;
}

const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
  const { currentPage, totalPages, limit, totalCount } = pagination;
  const limitOptions = [5, 10, 20, 50, 100];

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
      {/* Display total results and Limit Selector */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * limit + 1} to{' '}
          {Math.min(currentPage * limit, totalCount)} of {totalCount} results
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Items per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
        >
          &laquo;
        </button>
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
        >
          Prev
        </button>
        {/* Page Numbers */}
        {pageNumbers.map((num, idx) =>
          num === '...' ? (
            <span key={idx} className="px-2 py-1 text-gray-400">...</span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`px-3 py-1 rounded-md ${num === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-blue-100 text-gray-800'}`}
              disabled={num === currentPage}
            >
              {num}
            </button>
          )
        )}
        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-2 py-1 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
        >
          Next
        </button>
        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-2 py-1 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default Pagination;




