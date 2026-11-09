import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  CalendarDays,
  Video,
  ExternalLink,
  RefreshCw,
  LogOut,
  MapPin,
  Users,
  Check,
  Zap,
  ArrowRight,
  Layers,
  ChevronUp,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { WorkProject, WorkTask } from '../types';
import { speechService } from '../utils/speech';
import {
  GoogleCalendarEvent,
  SAMPLE_CALENDAR_EVENTS,
  fetchGoogleCalendarEvents,
  formatEventTimespan,
} from '../services/calendarService';
import {
  initAuth,
  googleSignIn,
  googleLogout,
} from '../services/firebaseAuth';

interface WorkCommandViewProps {
  projects: WorkProject[];
  onAddProject: (project: Omit<WorkProject, 'id'>) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
  onAddTask: (projectId: string, task: Omit<WorkTask, 'id'>) => void;
  onDeleteProject: (projectId: string) => void;
}

export const WorkCommandView: React.FC<WorkCommandViewProps> = ({
  projects,
  onAddProject,
  onToggleTask,
  onAddTask,
  onDeleteProject,
}) => {
  // View mode: 'split' (side-by-side tasks + calendar), 'projects' (projects focus), 'calendar' (agenda focus)
  const [activeLayout, setActiveLayout] = useState<'split' | 'projects' | 'calendar'>('split');

  // Project modals and expansion
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(projects[0]?.id || null);

  // New task input state keyed by project id
  const [newTaskText, setNewTaskText] = useState<{ [key: string]: string }>({});
  const [newTaskAI, setNewTaskAI] = useState<{ [key: string]: string }>({});

  // New project state
  const [title, setTitle] = useState('');
  const [clientOrDomain, setClientOrDomain] = useState('');
  const [deadline, setDeadline] = useState('In 5 days');
  const [budgetOrValue, setBudgetOrValue] = useState('5000');

  // Deep work focus timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<'focus' | 'break'>('focus');
  const [timerLabel, setTimerLabel] = useState('Deep Work Sprint');

  // Google Calendar Integration State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>(SAMPLE_CALENDAR_EVENTS);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarFilter, setCalendarFilter] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarSuccess, setCalendarSuccess] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Convert Calendar Event to Task Modal state
  const [eventToConvert, setEventToConvert] = useState<GoogleCalendarEvent | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>(projects[0]?.id || '');
  const [convertedTaskPriority, setConvertedTaskPriority] = useState<'urgent' | 'high' | 'medium'>('high');
  const [convertedTaskAI, setConvertedTaskAI] = useState('Vampiee');

  // Auth listener for Google Calendar
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        loadCalendarEvents(token);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      speechService.speak('Focus session complete. Vampiee recommends a brief hydration break.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Load calendar events
  const loadCalendarEvents = async (_token?: string) => {
    setIsLoadingCalendar(true);
    setCalendarError(null);
    try {
      const events = await fetchGoogleCalendarEvents();
      if (events && events.length > 0) {
        setCalendarEvents(events);
        setCalendarSuccess('Google Calendar synchronized successfully.');
        setTimeout(() => setCalendarSuccess(null), 3000);
      } else {
        setCalendarSuccess('Google Calendar connected (No upcoming events found).');
        setTimeout(() => setCalendarSuccess(null), 3000);
      }
    } catch (err: any) {
      console.warn('Calendar sync error:', err);
      setCalendarError(err.message || 'Failed to sync Google Calendar');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setCalendarError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        speechService.speak('Google Calendar linked. Synchronizing daily schedule with your work tasks.');
        await loadCalendarEvents(result.accessToken);
      }
    } catch (err: any) {
      setCalendarError(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleLogout();
      setCurrentUser(null);
      setCalendarEvents(SAMPLE_CALENDAR_EVENTS);
      speechService.speak('Google Calendar disconnected. Reverting to local schedule preview.');
    } catch (err: any) {
      console.error(err);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = (mins: number, type: 'focus' | 'break', label = 'Deep Work Sprint') => {
    setTimerSeconds(mins * 60);
    setTimerType(type);
    setTimerLabel(label);
    setIsTimerRunning(true);
    speechService.speak(`${label} of ${mins} minutes initiated. All distractions filtered.`);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientOrDomain) return;

    onAddProject({
      title,
      clientOrDomain,
      status: 'active',
      progress: 10,
      deadline,
      budgetOrValue: parseFloat(budgetOrValue) || 0,
      tasks: [
        { id: `t-${Date.now()}`, title: 'Initial setup & requirements sync', completed: false, priority: 'high', assignedAI: 'Vampiee' },
      ],
    });

    setTitle('');
    setClientOrDomain('');
    setShowAddProjectModal(false);
  };

  const handleCreateTask = (projectId: string) => {
    const text = newTaskText[projectId];
    if (!text || !text.trim()) return;

    onAddTask(projectId, {
      title: text.trim(),
      completed: false,
      priority: 'high',
      assignedAI: newTaskAI[projectId] || 'Claude',
    });

    setNewTaskText({ ...newTaskText, [projectId]: '' });
  };

  // Convert an event from calendar into a project task
  const handleConfirmConvertEvent = () => {
    if (!eventToConvert || !targetProjectId) return;

    const taskTitle = `[Cal Sync] ${eventToConvert.summary}`;
    onAddTask(targetProjectId, {
      title: taskTitle,
      completed: false,
      priority: convertedTaskPriority,
      assignedAI: convertedTaskAI,
      dueDate: eventToConvert.start.dateTime || eventToConvert.start.date,
    });

    setCalendarSuccess(`Event added as task in "${projects.find(p => p.id === targetProjectId)?.title || 'Project'}"!`);
    setTimeout(() => setCalendarSuccess(null), 3000);
    speechService.speak(`Calendar event synced as deliverable in your work queue.`);
    setEventToConvert(null);
  };

  // Filter events based on selected tab ('today', 'tomorrow', 'week')
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    return calendarEvents.filter((ev) => {
      const dateVal = ev.start.dateTime
        ? ev.start.dateTime.slice(0, 10)
        : ev.start.date || todayStr;

      if (calendarFilter === 'today') {
        return dateVal === todayStr || (!ev.start.dateTime && !ev.start.date);
      } else if (calendarFilter === 'tomorrow') {
        return dateVal === tomorrowStr;
      }
      return true; // week: show all upcoming
    });
  }, [calendarEvents, calendarFilter]);

  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = projects.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.completed).length,
    0
  );
  const totalValue = projects.reduce((sum, p) => sum + (p.budgetOrValue || 0), 0);

  // Today's timeline summary metrics
  const todayEventsCount = calendarEvents.filter(ev => {
    const dateVal = ev.start.dateTime ? ev.start.dateTime.slice(0, 10) : ev.start.date;
    return dateVal === new Date().toISOString().slice(0, 10);
  }).length;

  return (
    <div className="flex flex-col h-full bg-[#0d0f17]/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Top Bar with View Mode & Auth Status */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/70 backdrop-blur-md gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Work &amp; Calendar Command
              </h2>
              {currentUser ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CALENDAR SYNCED: {currentUser.email}
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CALENDAR PREVIEW
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Synchronize Google Calendar events side-by-side with your deliverables and AI delegations
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Mode Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveLayout('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeLayout === 'split'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="View tasks and calendar side-by-side"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split Schedule &amp; Tasks</span>
              <span className="sm:hidden">Split</span>
            </button>
            <button
              onClick={() => setActiveLayout('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeLayout === 'projects'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Tasks Only</span>
            </button>
            <button
              onClick={() => setActiveLayout('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeLayout === 'calendar'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          {/* Google Sign In / Sync Buttons */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loadCalendarEvents()}
                disabled={isLoadingCalendar}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs cursor-pointer"
                title="Refresh Google Calendar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin text-purple-400' : ''}`} />
              </button>
              <button
                onClick={handleSignOut}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Disconnect Google Calendar"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sync Calendar'}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddProjectModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Status alerts */}
      {calendarSuccess && (
        <div className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{calendarSuccess}</span>
        </div>
      )}
      {calendarError && (
        <div className="px-6 py-2 bg-rose-500/10 border-b border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{calendarError}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Vampiee AI Daily Schedule Alignment & Focus Advisor */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Vampiee Daily Schedule Intelligence</h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  {todayEventsCount} events today
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {todayEventsCount > 0
                  ? `You have ${todayEventsCount} scheduled events today. Focus blocks are mapped between meetings to optimize your ${projects.length} active deliverables.`
                  : 'Calendar clear today! Optimal day to schedule high-focus sprints on major project deliverables.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                speechService.speak(
                  `Vampiee schedule review: You have ${todayEventsCount} events scheduled today. Deep work blocks are synchronized with your pending tasks.`
                );
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Vocal Schedule Brief</span>
            </button>
          </div>
        </div>

        {/* Deep Work Focus HUD */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#181226] to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-18 h-18 rounded-2xl bg-slate-950 border border-purple-500/40 flex flex-col items-center justify-center shadow-lg font-mono">
              <span className="text-xl font-black text-purple-300">{formatTimer(timerSeconds)}</span>
              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                {isTimerRunning ? (timerType === 'focus' ? 'FOCUS' : 'REST') : 'STANDBY'}
              </span>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Deep Work Chronometer
                {isTimerRunning && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                )}
              </h3>
              <p className="text-xs font-mono text-purple-400 font-medium">{timerLabel}</p>
              <p className="text-[11px] text-slate-400">
                Sync focus blocks with your calendar schedule to protect uninterrupted build time.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isTimerRunning ? (
              <>
                <button
                  onClick={() => handleStartTimer(25, 'focus', '25m Sprint')}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" /> 25m Sprint
                </button>
                <button
                  onClick={() => handleStartTimer(50, 'focus', '50m Deep Flow')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-purple-300" /> 50m Flow
                </button>
                <button
                  onClick={() => handleStartTimer(5, 'break', '5m Rest Break')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  5m Break
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsTimerRunning(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(25 * 60);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Project & Calendar KPIs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Active Projects</span>
            <p className="text-lg font-bold text-white font-mono mt-0.5">
              {projects.length} Projects
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Tasks Completed</span>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {completedTasks} / {totalTasks} ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Pipeline Value</span>
            <p className="text-lg font-bold text-purple-400 font-mono mt-0.5">
              ${totalValue.toLocaleString()}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Scheduled Today</span>
            <p className="text-lg font-bold text-blue-400 font-mono mt-0.5 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-blue-400" />
              {todayEventsCount} Events
            </p>
          </div>
        </div>

        {/* Split Layout Container: Work Projects alongside Google Calendar */}
        <div className={`grid gap-6 ${activeLayout === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
          {/* Work Projects & Tasks Column */}
          {(activeLayout === 'split' || activeLayout === 'projects') && (
            <div className={activeLayout === 'split' ? 'lg:col-span-7 space-y-4' : 'space-y-4'}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  Active Deliverables &amp; AI Fleet Delegations
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {projects.length} Projects
                </span>
              </div>

              {projects.map((proj) => {
                const isExpanded = expandedProjectId === proj.id;
                const completedCount = proj.tasks.filter((t) => t.completed).length;

                return (
                  <div
                    key={proj.id}
                    className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-lg transition-all"
                  >
                    {/* Project Header */}
                    <div
                      className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
                      onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <button className="text-slate-400 hover:text-white">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {proj.clientOrDomain}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-rose-400" /> {proj.deadline}
                            </span>
                            {proj.budgetOrValue && (
                              <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                                ${proj.budgetOrValue.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="text-[11px] font-mono text-slate-300">
                            {completedCount}/{proj.tasks.length}
                          </span>
                          <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1">
                            <div
                              style={{ width: `${proj.tasks.length > 0 ? (completedCount / proj.tasks.length) * 100 : 0}%` }}
                              className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full"
                            />
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(proj.id);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Tasks Section */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-2.5">
                        <div className="space-y-1.5">
                          {proj.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <button
                                  onClick={() => onToggleTask(proj.id, task.id)}
                                  className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>
                                <span
                                  className={`text-xs ${
                                    task.completed
                                      ? 'line-through text-slate-500'
                                      : 'text-slate-200 font-medium'
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                {task.assignedAI && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {task.assignedAI}
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                                    task.priority === 'urgent'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : task.priority === 'high'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Quick Add Task Input */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Add deliverable or milestone..."
                            value={newTaskText[proj.id] || ''}
                            onChange={(e) =>
                              setNewTaskText({ ...newTaskText, [proj.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateTask(proj.id);
                            }}
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                          />

                          <select
                            value={newTaskAI[proj.id] || 'Claude'}
                            onChange={(e) =>
                              setNewTaskAI({ ...newTaskAI, [proj.id]: e.target.value })
                            }
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500 font-mono"
                          >
                            <option value="Vampiee">Assign: Vampiee</option>
                            <option value="Claude">Assign: Claude</option>
                            <option value="GPT-4o">Assign: GPT-4o</option>
                            <option value="Gemini">Assign: Gemini</option>
                            <option value="Manual">Self</option>
                          </select>

                          <button
                            onClick={() => handleCreateTask(proj.id)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Google Calendar Schedule & Daily Agenda Column */}
          {(activeLayout === 'split' || activeLayout === 'calendar') && (
            <div className={activeLayout === 'split' ? 'lg:col-span-5 space-y-4' : 'space-y-4'}>
              {/* Calendar Header with Day Selector */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Google Calendar Schedule</h3>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium">
                    <button
                      onClick={() => setCalendarFilter('today')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        calendarFilter === 'today'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setCalendarFilter('tomorrow')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        calendarFilter === 'tomorrow'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tomorrow
                    </button>
                    <button
                      onClick={() => setCalendarFilter('week')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        calendarFilter === 'week'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      7 Days
                    </button>
                  </div>
                </div>

                {/* Connection status banner */}
                {!currentUser && (
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="text-blue-200 text-[11px]">
                      Showing preview schedule. Connect your Google account to fetch your live calendar.
                    </div>
                    <button
                      onClick={handleSignIn}
                      disabled={isSigningIn}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold shrink-0 cursor-pointer"
                    >
                      {isSigningIn ? 'Connecting...' : 'Connect Calendar'}
                    </button>
                  </div>
                )}

                {/* Timeline Events List */}
                <div className="space-y-2.5 pt-1">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs font-mono">
                      No scheduled events found for this period.
                    </div>
                  ) : (
                    filteredEvents.map((event) => {
                      const { timeStr, dateStr, isNow, isAllDay } = formatEventTimespan(event);

                      return (
                        <div
                          key={event.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isNow
                              ? 'bg-gradient-to-r from-blue-950/60 to-purple-950/40 border-blue-500/60 shadow-lg shadow-blue-950/30'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                  isNow
                                    ? 'bg-blue-500 text-white animate-pulse'
                                    : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {isNow ? 'HAPPENING NOW' : timeStr}
                                </span>

                                {calendarFilter === 'week' && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {dateStr}
                                  </span>
                                )}

                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                                  event.category === 'meeting'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : event.category === 'deep_work'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : event.category === 'deadline'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {event.category || 'event'}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-white mt-1">
                                {event.summary}
                              </h4>

                              {event.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>

                            {/* Convert to Task Button */}
                            <button
                              onClick={() => {
                                setEventToConvert(event);
                                setTargetProjectId(projects[0]?.id || '');
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-purple-600/30 hover:border-purple-500/40 border border-slate-700 text-slate-300 hover:text-purple-300 text-[10px] font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                              title="Import as active deliverable"
                            >
                              <Plus className="w-3 h-3" />
                              <span className="hidden sm:inline">Add as Task</span>
                            </button>
                          </div>

                          {/* Location, Google Meet & Attendees Footer */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                            <div className="flex items-center gap-3">
                              {event.hangoutLink ? (
                                <a
                                  href={event.hangoutLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                                >
                                  <Video className="w-3 h-3 text-blue-400" />
                                  <span>Join Meet</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : event.location ? (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  <span className="truncate max-w-[140px]">{event.location}</span>
                                </span>
                              ) : null}

                              {event.attendees && event.attendees.length > 0 && (
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Users className="w-3 h-3 text-slate-500" />
                                  <span>{event.attendees.length} attendees</span>
                                </span>
                              )}
                            </div>

                            {/* Quick Start Focus Timer for this event */}
                            <button
                              onClick={() => handleStartTimer(30, 'focus', event.summary)}
                              className="text-[10px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-2.5 h-2.5 fill-purple-400" />
                              <span>Focus Timer</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Convert Calendar Event into Project Task Modal */}
      {eventToConvert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Import Event as Deliverable</h3>
              </div>
              <button
                onClick={() => setEventToConvert(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500">Event Title</span>
              <p className="text-xs font-semibold text-white">{eventToConvert.summary}</p>
              {eventToConvert.start.dateTime && (
                <p className="text-[11px] font-mono text-purple-400">
                  {formatEventTimespan(eventToConvert).timeStr}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.clientOrDomain})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Priority</label>
                  <select
                    value={convertedTaskPriority}
                    onChange={(e: any) => setConvertedTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Assigned AI</label>
                  <select
                    value={convertedTaskAI}
                    onChange={(e) => setConvertedTaskAI(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Vampiee">Vampiee</option>
                    <option value="Claude">Claude</option>
                    <option value="GPT-4o">GPT-4o</option>
                    <option value="Gemini">Gemini</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEventToConvert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConvertEvent}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Add Deliverable</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Work Project</h3>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Agent SaaS Landing Page & Auth"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Client or Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp / Internal Venture"
                  value={clientOrDomain}
                  onChange={(e) => setClientOrDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. In 4 days"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Budget / Value ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={budgetOrValue}
                    onChange={(e) => setBudgetOrValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
