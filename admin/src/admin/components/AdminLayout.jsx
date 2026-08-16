import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  return (
    <div className="bg-page-bg text-on-surface font-body-md flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-[280px] transition-all duration-200">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-page-bg p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
