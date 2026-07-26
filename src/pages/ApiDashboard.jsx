import React from 'react';

const ApiDashboard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-[#0B1121] text-slate-900 dark:text-white">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-2">Developer API</h1>
        <p className="text-slate-500">Panel exclusivo para usuarios PLUS.</p>
        <div className="mt-8 p-4 bg-slate-200 dark:bg-slate-800 rounded-lg font-mono text-sm">
            API_KEY: ***************************
        </div>
      </div>
    </div>
  );
};

export default ApiDashboard;