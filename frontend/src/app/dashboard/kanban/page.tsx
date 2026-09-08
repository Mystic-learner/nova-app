'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Kanban, ArrowRight } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  _count?: { tasks: number };
}

export default function KanbanPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-sm p-8">Loading workspace boards...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Kanban Boards</h1>
        <p className="text-sm text-gray-400 mt-1">Select a workspace board to view and drag tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="p-5 bg-[#131B2E] border border-gray-800 hover:border-violet-500/40 rounded-xl transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-600/10 rounded-lg border border-violet-500/20 text-violet-400 group-hover:scale-105 transition-transform">
                <Kanban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-violet-300">{project.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {project.description || 'Workspace Kanban Board'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}