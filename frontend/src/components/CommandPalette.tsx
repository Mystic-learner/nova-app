'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, FolderKanban, Plus, Sparkles, ArrowRight, Command as CmdIcon } from 'lucide-react';

interface Project {
  id: string;
  name: string;
}

interface CommandPaletteProps {
  projects: Project[];
}

export default function CommandPalette({ projects = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Bulletproof Listener for Cmd + K or Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // .toLowerCase() protects against Caps Lock being active
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); // Immediately stops the browser's Google search
        setOpen((open) => !open);
      }
    };

    // { capture: true } guarantees our app intercepts the keystroke BEFORE the browser does
    document.addEventListener('keydown', down, { capture: true });
    return () => document.removeEventListener('keydown', down, { capture: true });
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      // Deep, immersive backdrop with extreme blur
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] bg-[#03040B]/60 backdrop-blur-md transition-all"
    >
      {/* Ambient Glowing Orb Behind the Palette */}
      <div className="absolute top-[20vh] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Palette Container: Ultra-glassy, 1px bright edge */}
      <div className="relative w-full max-w-2xl bg-[#090D14]/70 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-[0_0_120px_-20px_rgba(139,92,246,0.3)] overflow-hidden font-sans ring-1 ring-black/50">
        
        {/* Top Search Area */}
        <div className="flex items-center px-5 h-16 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent">
          <Search className="w-5 h-5 text-violet-400 mr-4 opacity-70" />
          <Command.Input
            placeholder="What do you want to do?"
            // Thinner, larger font for that premium modern look
            className="flex-1 bg-transparent text-gray-100 placeholder:text-gray-500/70 focus:outline-none text-lg font-light tracking-wide"
          />
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.05] border border-white/[0.05] rounded-md shadow-sm">
            <CmdIcon className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400">K</span>
          </div>
        </div>

        {/* Scrollable List with Fade Masks */}
        {/* The mask-image creates a smooth fade out at the top and bottom of the list when scrolling */}
        <Command.List 
          className="max-h-[55vh] overflow-y-auto p-3 overscroll-contain pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] [&::-webkit-scrollbar]:hidden"
        >
          <div className="py-4"> {/* Padding inside the mask so items don't instantly clip */}
            <Command.Empty className="py-14 text-center text-sm text-gray-500 font-light">
              No workspaces found.
            </Command.Empty>

            <Command.Group
              heading={
                <span className="text-[10px] font-bold bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent tracking-[0.2em] px-3">
                  YOUR WORKSPACES
                </span>
              }
              className="mb-4 mt-2"
            >
              {projects.map((project) => (
                <Command.Item
                  key={project.id}
                  onSelect={() => runCommand(() => router.push(`/dashboard/projects/${project.id}`))}
                  // Linear-style active state: Left border accent + smooth gradient background
                  className="group relative flex items-center justify-between px-4 py-3.5 mx-1 my-1.5 rounded-xl cursor-pointer text-sm text-gray-300 border-l-2 border-transparent data-[selected=true]:border-violet-500 data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-violet-500/15 data-[selected=true]:to-transparent data-[selected=true]:text-white transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/[0.03] group-data-[selected=true]:bg-violet-500/20 group-data-[selected=true]:shadow-[0_0_15px_rgba(139,92,246,0.3)] rounded-lg transition-all duration-300">
                      <FolderKanban className="w-4 h-4 text-gray-400 group-data-[selected=true]:text-violet-300 transition-colors" />
                    </div>
                    <span className="font-medium tracking-wide">{project.name}</span>
                  </div>
                  
                  {/* Glowing Arrow Pill */}
                  <span className="text-[10px] font-bold px-3 py-1.5 bg-violet-500/10 text-violet-300 rounded-full border border-violet-500/30 opacity-0 translate-x-2 group-data-[selected=true]:opacity-100 group-data-[selected=true]:translate-x-0 transition-all duration-300 flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                    ENTER <ArrowRight className="w-3 h-3" />
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading={
                <span className="text-[10px] font-bold bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent tracking-[0.2em] px-3">
                  QUICK ACTIONS
                </span>
              }
            >
              <Command.Item
                onSelect={() => runCommand(() => router.push('/dashboard/projects/new'))}
                // Neon Green accent for creation
                className="group relative flex items-center justify-between px-4 py-3.5 mx-1 my-1.5 rounded-xl cursor-pointer text-sm text-gray-300 border-l-2 border-transparent data-[selected=true]:border-emerald-500 data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-emerald-500/10 data-[selected=true]:to-transparent data-[selected=true]:text-white transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/[0.03] group-data-[selected=true]:bg-emerald-500/20 group-data-[selected=true]:shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-lg transition-all duration-300">
                    <Plus className="w-4 h-4 text-gray-400 group-data-[selected=true]:text-emerald-400" />
                  </div>
                  <span className="font-medium tracking-wide">Initialize New Workspace</span>
                </div>
              </Command.Item>
            </Command.Group>
          </div>
        </Command.List>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#000000]/40 border-t border-white/[0.05] backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            Nova OS 
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              Move
              <kbd className="px-1.5 py-0.5 bg-white/[0.05] rounded text-gray-400 border border-white/[0.1]">↑↓</kbd>
            </span>
            <span className="flex items-center gap-1.5">
              Open
              <kbd className="px-1.5 py-0.5 bg-white/[0.05] rounded text-gray-400 border border-white/[0.1]">↵</kbd>
            </span>
          </div>
        </div>

      </div>
    </Command.Dialog>
  );
}