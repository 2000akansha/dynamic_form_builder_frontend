
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const TableHeading = ({ label, isSorted, sortOrder, onSort }) => {
  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
      onClick={onSort}
    >
      <div className="flex gap-500 items-center">
        {label}
        {isSorted ? (
          sortOrder === '1' ? (
            <FaSortUp className="text-blue-500" />
          ) : (
            <FaSortDown className="text-blue-500" />
          )
        ) : (
          <FaSort className="text-gray-500" />
        )}
      </div>
    </th>
  );
};

export default TableHeading;
