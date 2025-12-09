// src\components\Home\PaginationControls.js
import { ChevronLeft, ChevronRight } from "lucide-react";

const PaginationControls = ({ currentPage, totalPages, setCurrentPage }) => (
  <div className="flex items-center space-x-2">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
      disabled={currentPage === 1}
      className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform duration-100"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>

    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
      disabled={currentPage >= totalPages}
      className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform duration-100"
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);

export default PaginationControls;
