'use client';

import { X, Activity, CheckCircle2, PlusCircle, ArrowRightCircle } from 'lucide-react';

export interface LogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'CREATED' | 'UPDATED' | 'COMPLETED';
}

interface ActivityLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
}

export default function ActivityLogDrawer({ isOpen, onClose, logs }: ActivityLogDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#131B2E] border-l border-violet-900/40 h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">Activity Timeline</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timeline Feed */}
          <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No recent activity logged.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="relative pl-6 border-l border-gray-800 space-y-1">
                  <span className="absolute -left-[9px] top-0 w-4 h-4 bg-[#0B0F17] rounded-full flex items-center justify-center">
                    {log.type === 'CREATED' && <PlusCircle className="w-3.5 h-3.5 text-violet-400" />}
                    {log.type === 'UPDATED' && <ArrowRightCircle className="w-3.5 h-3.5 text-blue-400" />}
                    {log.type === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </span>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-200">{log.action}</span>
                    <span className="text-[10px] text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-400">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-800 text-center">
          <span className="text-[11px] text-gray-500">Live Workspace Stream</span>
        </div>
      </div>
    </div>
  );
}