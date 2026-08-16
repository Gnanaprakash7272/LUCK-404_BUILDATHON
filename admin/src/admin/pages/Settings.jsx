import React from 'react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-border-subtle/50">
        <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Settings</h2>
        <p className="font-body-lg text-[16px] text-text-secondary">Manage your admin preferences and institutional configuration.</p>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm space-y-8">
        <div>
          <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface mb-4">Profile Information</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-[14px] font-medium text-on-surface mb-1">Display Name</label>
              <input type="text" className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary bg-surface-container-lowest" defaultValue="System Administrator" />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-on-surface mb-1">Email Address</label>
              <input type="email" className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-primary bg-surface-container-lowest" defaultValue="admin@eduportal.com" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-subtle">
          <h3 className="font-headline-sm text-[18px] font-semibold text-on-surface mb-4">Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-border-subtle" defaultChecked />
              <span className="text-[14px] text-on-surface">Enable email notifications for high-risk alerts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-border-subtle" defaultChecked />
              <span className="text-[14px] text-on-surface">Weekly summary report generation</span>
            </label>
          </div>
        </div>
        
        <div className="pt-6 border-t border-border-subtle flex justify-end">
          <button className="px-6 py-2 bg-primary rounded-lg text-white font-medium hover:bg-primary-fixed-variant transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
