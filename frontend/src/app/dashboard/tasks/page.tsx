'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckSquare, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  project?: { name: string };
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/my-tasks')
      .then((res) => setTasks(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-sm p-8">Loading tasks...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Assigned Tasks</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of your pending and completed items</p>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="p-8 bg-[#131B2E] border border-gray-800 rounded-xl text-center text-gray-500 text-sm">
            No tasks assigned to you yet.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-[#131B2E] border border-gray-800 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-violet-400" />
                <div>
                  <h4 className="text-sm font-medium text-white">{task.title}</h4>
                  {task.project && (
                    <span className="text-xs text-gray-500">{task.project.name}</span>
                  )}
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 bg-[#0B0F17] text-gray-300 border border-gray-800 rounded-md">
                {task.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}