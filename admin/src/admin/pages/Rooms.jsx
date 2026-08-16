import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/Badge';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    const data = await adminApi.getRooms();
    setRooms(data);
    setIsLoading(false);
  };

  const filteredRooms = rooms.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Room ID & Type',
      accessor: 'id',
      render: (item) => (
        <div>
          <p className="font-medium text-on-surface">{item.id}</p>
          <span className="px-1.5 py-0.5 bg-surface-container-high rounded text-[10px] font-medium text-text-secondary tracking-wider uppercase">
            {item.type}
          </span>
        </div>
      )
    },
    { 
      header: 'Location', 
      accessor: 'building',
      render: (item) => (
        <div>
          <p className="text-on-surface text-[13px]">{item.building}</p>
          <p className="text-[12px] text-text-secondary">Floor {item.floor}</p>
        </div>
      )
    },
    { 
      header: 'Capacity', 
      accessor: 'capacity',
      render: (item) => (
        <div className="flex items-center gap-1 font-medium text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">group</span>
          {item.capacity} Seats
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-border-subtle/50">
        <div>
          <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Room Management</h2>
          <p className="font-body-lg text-[16px] text-text-secondary">Manage physical infrastructure and availability.</p>
        </div>
        <button className="px-4 py-2 bg-primary rounded-lg text-on-primary text-[14px] font-medium flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Room
        </button>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 shadow-sm">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-subtle rounded-lg text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
            placeholder="Search by room ID or building..." 
            type="text" 
          />
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">Loading rooms...</div>
        ) : (
          <DataTable 
            data={filteredRooms} 
            columns={columns} 
            selectable={false}
          />
        )}
      </div>
    </div>
  );
};

export default Rooms;
