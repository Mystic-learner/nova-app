'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FolderKanban, Plus, Clock, ArrowRight, LayoutDashboard, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all projects for the logged-in user
        const res = await api.get('/projects');
        const fetchedProjects = res.data?.data || [];
        
        setProjects(fetchedProjects);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        if (err?.response?.status === 401) {
          setError('Session expired. Please log in again.');
          router.push('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to load your workspace.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-violet-500 rounded-full animate-spin mx-auto shadow-lg shadow-violet-500/20" />
          <p className="text-gray-400 text-xs tracking-wide">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <div className="bg-[#131B2E] border border-red-500/20 rounded-2xl p-8 max-w-lg w-full shadow-2xl text-center space-y-5 backdrop-blur-md">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-lg shadow-red-500/10">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Error Loading Dashboard</h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-violet-400" />
            Workspace Overview
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage your active projects and tasks.</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20"
        >
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#131B2E] border border-gray-800 rounded-2xl p-12 text-center shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-[#0B0F17] border border-gray-800 rounded-2xl flex items-center justify-center text-gray-500 mb-2">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No active projects</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            You haven't created any project boards yet. Start by creating a new workspace to organize your tasks.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B0F17] hover:bg-gray-800 border border-violet-500/30 hover:border-violet-500/60 text-violet-300 rounded-xl text-sm font-semibold transition-all mt-4"
          >
            <Plus className="w-4 h-4" /> Create First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <div className="group bg-[#131B2E] hover:bg-[#18223a] border border-gray-800 hover:border-violet-500/50 rounded-2xl p-5 transition-all shadow-lg hover:shadow-violet-500/10 cursor-pointer h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-[#0B0F17] rounded-lg text-violet-400 group-hover:text-violet-300 transition-colors border border-gray-800 group-hover:border-violet-500/30">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
                </div>
                
                <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-violet-100 transition-colors">
                  {project.name}
                </h3>
                
                <p className="text-xs text-gray-400 line-clamp-2 mb-6 flex-1">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-800/80 mt-auto">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Active Workspace</span>
                  </div>
                  {project.status && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider bg-slate-800 text-slate-400">
                      {project.status}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}