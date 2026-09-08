'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ActivityLogDrawer, { LogEntry } from '@/components/ActivityLogDrawer';
import { Plus, ArrowLeft, Search, Filter, User as UserIcon, Activity, FolderPlus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedToId?: string;
  assignedTo?: User;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap promise without try/catch wrapper as required by Next.js use()
  const resolvedParams = use(params);
  const projectId = resolvedParams?.id;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignedToId, setAssignedToId] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  useEffect(() => {
    // Guard against undefined, placeholders, or empty parameters
    if (
      !projectId ||
      typeof projectId !== 'string' ||
      projectId === '[id]' ||
      projectId === 'undefined' ||
      projectId === 'null' ||
      !projectId.trim()
    ) {
      setLoading(false);
      setError('Please select a project from your dashboard.');
      return;
    }

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectRes = await api.get(`/projects/${projectId}`);
        if (projectRes?.data?.data) {
          setProject(projectRes.data.data);
        } else {
          setError('Project not found or accessible');
          setProject(null);
        }

        try {
          const userRes = await api.get('/auth/me');
          const userData = userRes?.data?.data;
          if (userData?.id) {
            setCurrentUser(userData);
            setAssignedToId(userData.id);
          }
        } catch (userErr) {
          console.warn('Failed to fetch user profile:', userErr);
        }
      } catch (err: any) {
        console.error('Failed to fetch project details:', err);
        const status = err?.response?.status;
        if (status === 401) {
          setError('Unauthorized session. Please log in again.');
        } else if (status === 404 || status === 400) {
          setError('Project not found or accessible');
        } else {
          setError('Failed to load project details.');
        }
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    if (
      !isActivityOpen ||
      !projectId ||
      typeof projectId !== 'string' ||
      projectId === '[id]' ||
      projectId === 'undefined' ||
      projectId === 'null'
    ) {
      return;
    }

    const fetchActivityLogs = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/activity`);
        const rawLogs = res?.data?.data || [];
        const formattedLogs: LogEntry[] = rawLogs.map((log: any) => ({
          id: log.id || '',
          action: log.action === 'CREATED' ? 'Created' : 'Updated',
          details: log.changes?.title ? `Task "${log.changes.title}"` : 'Project updated',
          timestamp: new Date(log.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          type: 'UPDATED',
        }));
        setActivityLogs(formattedLogs);
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
      }
    };

    fetchActivityLogs();
  }, [isActivityOpen, projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !projectId || projectId === 'undefined') return;

    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title: taskTitle.trim(),
        priority: taskPriority,
        assignedToId: assignedToId || undefined,
      });

      setTaskTitle('');
      setIsAdding(false);
      setTaskPriority('MEDIUM');

      const res = await api.get(`/projects/${projectId}`);
      if (res?.data?.data) {
        setProject(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to create task:', err);
      alert(err?.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    if (!projectId || projectId === 'undefined') return;

    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      const res = await api.get(`/projects/${projectId}`);
      if (res?.data?.data) {
        setProject(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to update task status:', err);
      alert(err?.response?.data?.message || 'Failed to update task status');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as Task['status'];

    if (project) {
      const updatedTasks = project.tasks.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus } : t
      );
      setProject({ ...project, tasks: updatedTasks });
    }

    try {
      await api.put(`/tasks/${draggableId}/status`, { status: newStatus });
    } catch (err: any) {
      console.error('Failed to update task status via drag and drop:', err);
      if (project) {
        const revertedTasks = project.tasks.map((t) =>
          t.id === draggableId ? { ...t, status: source.droppableId as Task['status'] } : t
        );
        setProject({ ...project, tasks: revertedTasks });
      }
      alert('Failed to update task position.');
    }
  };

  // Render Fallback for Invalid or Missing ID
  if (
    !projectId ||
    typeof projectId !== 'string' ||
    projectId === '[id]' ||
    projectId === 'undefined' ||
    projectId === 'null' ||
    !projectId.trim()
  ) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <div className="bg-[#131B2E] border border-violet-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 backdrop-blur-md">
          <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/30 rounded-2xl flex items-center justify-center mx-auto text-violet-400 shadow-lg shadow-violet-500/10">
            <FolderPlus className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Select a Workspace</h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Please choose an active project board from your dashboard or create a new workspace to start tracking tasks.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-violet-600/20"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>
            <Link
              href="/dashboard/projects/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B0F17] hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4 text-violet-400" /> New Project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-violet-500 rounded-full animate-spin mx-auto shadow-lg shadow-violet-500/20" />
          <p className="text-gray-400 text-xs tracking-wide">Loading workspace board...</p>
        </div>
      </div>
    );
  }

  // Render Error
  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <div className="bg-[#131B2E] border border-violet-500/20 rounded-2xl p-8 max-w-lg w-full shadow-2xl text-center space-y-5 backdrop-blur-md">
          <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/30 rounded-2xl flex items-center justify-center mx-auto text-violet-400 shadow-lg shadow-violet-500/10">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{error || 'Project not found or accessible'}</h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              The project ID in your URL does not exist in your database or you do not have permission to view this board.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-violet-600/25"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>
            <Link
              href="/dashboard/projects/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B0F17] hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4 text-violet-400" /> Create Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredTasks = (project.tasks || []).filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'ALL' || task.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const columns: { label: string; status: Task['status']; color: string }[] = [
    { label: 'To Do', status: 'TODO', color: 'border-slate-800' },
    { label: 'In Progress', status: 'IN_PROGRESS', color: 'border-violet-900/50' },
    { label: 'Completed', status: 'DONE', color: 'border-emerald-900/50' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{project.description || 'Workspace Kanban Board'}</p>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsActivityOpen(true)} className="flex items-center gap-2 px-3.5 py-2 bg-[#131B2E] border border-gray-800 hover:border-violet-500/40 text-gray-300 rounded-lg text-xs font-medium transition-all">
            <Activity className="w-4 h-4 text-violet-400" /> Activity Log
          </button>
          <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-violet-600/20">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-[#131B2E] p-3 rounded-xl border border-gray-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tasks in this board..." className="w-full pl-9 pr-4 py-1.5 bg-[#0B0F17] border border-gray-800 rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="px-3 py-1.5 bg-[#0B0F17] border border-gray-800 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-violet-500">
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateTask} className="p-4 bg-[#131B2E] border border-violet-900/40 rounded-xl space-y-3 shadow-lg">
          <input type="text" required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task title..." className="w-full px-3.5 py-2 bg-[#0B0F17] border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-violet-500" autoFocus />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as any)} className="px-3 py-1.5 bg-[#0B0F17] border border-gray-800 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-violet-500">
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className="px-3 py-1.5 bg-[#0B0F17] border border-gray-800 rounded-lg text-xs text-gray-300 focus:outline-none focus:border-violet-500">
                <option value="">Unassigned</option>
                {currentUser && <option value={currentUser.id}>Assign to Me ({currentUser.firstName})</option>}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" disabled={!taskTitle.trim()} className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors">Add Task</button>
            </div>
          </div>
        </form>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <Droppable key={col.status} droppableId={col.status}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`bg-[#131B2E] border ${col.color} rounded-xl p-4 flex flex-col min-h-[450px] transition-colors ${snapshot.isDraggingOver ? 'bg-[#18223a]' : ''}`}>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800/80">
                      <h3 className="font-semibold text-sm text-white">{col.label}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">{colTasks.length}</span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {colTasks.length === 0 ? (
                        <div className="text-center text-xs text-gray-600 py-8">No matching tasks</div>
                      ) : (
                        colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`p-3.5 bg-[#0B0F17] border rounded-lg shadow-sm space-y-2 cursor-grab active:cursor-grabbing transition-all ${snapshot.isDragging ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 'border-gray-800/80 hover:border-violet-500/30'}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-medium text-gray-200">{task.title}</p>
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider whitespace-nowrap ${task.priority === 'HIGH' ? 'bg-red-950/50 text-red-400 border border-red-500/30' : task.priority === 'MEDIUM' ? 'bg-amber-950/50 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>{task.priority}</span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-900">
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                    <UserIcon className="w-3 h-3 text-violet-400" />
                                    <span>{task.assignedTo?.firstName || (task.assignedToId ? 'Assigned' : 'Unassigned')}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {col.status !== 'TODO' && (
                                      <button type="button" onClick={() => handleUpdateStatus(task.id, col.status === 'DONE' ? 'IN_PROGRESS' : 'TODO')} className="text-[10px] px-1.5 py-0.5 text-gray-400 hover:text-white bg-gray-800/60 rounded transition-colors" title="Move back">←</button>
                                    )}
                                    {col.status !== 'DONE' && (
                                      <button type="button" onClick={() => handleUpdateStatus(task.id, col.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')} className="text-[10px] px-1.5 py-0.5 text-violet-300 hover:text-violet-200 bg-violet-600/20 border border-violet-500/30 rounded font-medium transition-colors" title="Move forward">→</button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <ActivityLogDrawer isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} logs={activityLogs} />
    </div>
  );
}