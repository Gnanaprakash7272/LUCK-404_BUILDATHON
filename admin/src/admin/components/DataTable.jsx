import React, { useState } from 'react';

export const DataTable = ({ 
  columns, 
  data, 
  keyField = 'id', 
  onEdit, 
  onDelete, 
  onView,
  selectable = false,
  selectedItems = [],
  onSelectionChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(currentData.map(item => item[keyField]));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter(itemId => itemId !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  };

  const isAllSelected = currentData.length > 0 && currentData.every(item => selectedItems.includes(item[keyField]));

  return (
    <div className="w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-container-lowest">
              {selectable && (
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary bg-surface-white border-border-subtle rounded focus:ring-primary focus:ring-1 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-4 font-label-md text-[12px] font-medium text-text-secondary uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-6 py-4 font-label-md text-[12px] font-medium text-text-secondary uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 2 : 1)} className="px-6 py-8 text-center text-text-secondary">
                  No data available.
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr key={item[keyField]} className={`hover:bg-surface-container-low transition-colors group ${selectedItems.includes(item[keyField]) ? 'bg-primary/5' : ''}`}>
                  {selectable && (
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox"
                        checked={selectedItems.includes(item[keyField])}
                        onChange={() => handleSelectItem(item[keyField])}
                        className="w-4 h-4 text-primary bg-surface-white border-border-subtle rounded focus:ring-primary focus:ring-1 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, index) => (
                    <td key={index} className="px-6 py-4 text-[14px] text-on-surface">
                      {col.render ? col.render(item) : item[col.accessor]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onView && (
                          <button onClick={() => onView(item)} className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="View">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} className="p-1 text-on-surface-variant hover:text-risk-high transition-colors" title="Delete">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-border-subtle">
          <p className="text-[12px] text-text-secondary">
            Showing <span className="font-medium text-on-surface">{data.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-on-surface">{Math.min(currentPage * itemsPerPage, data.length)}</span> of <span className="font-medium text-on-surface">{data.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded text-[14px] font-medium flex items-center justify-center transition-colors ${
                    currentPage === i + 1 ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
