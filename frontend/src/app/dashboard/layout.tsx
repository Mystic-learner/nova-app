'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { LayoutDashboard, CheckSquare, LogOut, FolderKanban, Sparkles } from 'lucide-react';
import CommandPalette from '@/components/CommandPalette';

interface Project {
  id: string;
  name: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch projects list so Command Palette can search workspaces in real time
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch projects for command palette', err);
      }
    };
    fetchProjects();
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Projects', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Kanban Board', href: '/dashboard/kanban', icon: FolderKanban },
    { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex relative">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#131B2E]/90 backdrop-blur-md border-r border-violet-900/30 flex flex-col justify-between p-4 z-20">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-gray-800/80">
            <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-violet-600/30 border border-violet-400/30">
              N
            </div>
            <span className="font-bold text-lg tracking-wide text-white">NOVA</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-md shadow-violet-950/40'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.firstName || 'User'}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email || 'user@nova.com'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Top Floating Command Bar Indicator */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#131B2E]/70 border border-violet-900/30 rounded-lg text-xs text-gray-400 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Search or trigger menu:</span>
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-gray-300 bg-gray-900 border border-gray-800 rounded shadow-inner">
              ⌘K / Ctrl+K
            </kbd>
          </div>
        </div>

        {children}
      </main>

      {/* Global Command Palette Modal Listener */}
      <CommandPalette projects={projects} />
    </div>
  );
}