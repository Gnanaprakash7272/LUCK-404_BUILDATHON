import React from 'react';

const Support = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-border-subtle/50">
        <h2 className="font-display-lg text-[36px] font-bold text-on-surface mb-1">Support Center</h2>
        <p className="font-body-lg text-[16px] text-text-secondary">Get help and resources for the Education Management Portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-[48px] text-primary mb-4">menu_book</span>
          <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-2">Documentation</h3>
          <p className="text-[14px] text-text-secondary mb-6 flex-1">Read the complete guide to using the admin dashboard, generating reports, and interpreting AI insights.</p>
          <button className="px-4 py-2 bg-surface-container-low text-primary rounded-lg font-medium hover:bg-surface-container-high transition-colors w-full">View Docs</button>
        </div>

        <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-[48px] text-primary mb-4">forum</span>
          <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-2">Contact Support</h3>
          <p className="text-[14px] text-text-secondary mb-6 flex-1">Need help with a technical issue or have a feature request? Our support team is here to help.</p>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-fixed-variant transition-colors w-full">Open Ticket</button>
        </div>
      </div>

      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
        <h3 className="font-headline-sm text-[20px] font-semibold text-on-surface mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="border-b border-border-subtle pb-4">
            <h4 className="font-medium text-[16px] text-on-surface mb-2">How frequently is the AI Insight data updated?</h4>
            <p className="text-[14px] text-text-secondary">The models run nightly batches to analyze the day's attendance and grade inputs. You will see fresh insights every morning.</p>
          </div>
          <div className="border-b border-border-subtle pb-4">
            <h4 className="font-medium text-[16px] text-on-surface mb-2">Can I export custom datasets?</h4>
            <p className="text-[14px] text-text-secondary">Yes, you can generate custom CSV exports from the Reports Hub by selecting 'Custom Report'.</p>
          </div>
          <div>
            <h4 className="font-medium text-[16px] text-on-surface mb-2">How do I add a new Teacher?</h4>
            <p className="text-[14px] text-text-secondary">Navigate to the Teachers Management page and click the 'Add Teacher' button in the top right corner.</p>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-8">
        <p className="text-[12px] text-text-secondary">EduAdmin System v1.0.0 (Build 4921)</p>
      </div>
    </div>
  );
};

export default Support;
