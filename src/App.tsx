import React, { useState, useEffect, useCallback } from 'react';
import {
  InvestmentAsset,
  MonetizationStream,
  WorkProject,
  WorkTask,
  SyncedAIModel,
  ChatMessage,
  ActiveTab,
  ViewMode,
  AvatarStyle,
  PersonalSyncState,
  ConnectedAppItem,
  TradeJournalEntry,
} from './types';
import {
  INITIAL_ASSETS,
  INITIAL_MONETIZATION_STREAMS,
  INITIAL_PROJECTS,
  INITIAL_SYNCED_AIS,
  INITIAL_MESSAGES,
  INITIAL_PERSONAL_SYNC,
  INITIAL_CONNECTED_APPS,
  INITIAL_TRADE_JOURNAL,
  loadFromStorage,
  saveToStorage,
} from './utils/storage';
import { speechService } from './utils/speech';
import { TopNav } from './components/TopNav';
import { VoiceChatView } from './components/VoiceChatView';
import { PersonalSyncView } from './components/PersonalSyncView';
import { ContactsView } from './components/ContactsView';
import { AISyncHubView } from './components/AISyncHubView';
import { InvestmentVaultView } from './components/InvestmentVaultView';
import { MonetizationEngineView } from './components/MonetizationEngineView';
import { WorkCommandView } from './components/WorkCommandView';
import { DesktopSimulator } from './components/DesktopSimulator';
import { DailyMusicStudioView } from './components/DailyMusicStudioView';
import { AppsTradingHubView } from './components/AppsTradingHubView';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [viewMode, setViewMode] = useState<ViewMode>('studio');
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(() =>
    loadFromStorage('avatarStyle', 'cartoon')
  );

  // Application Data States (persisted)
  const [assets, setAssets] = useState<InvestmentAsset[]>(() =>
    loadFromStorage('assets', INITIAL_ASSETS)
  );
  const [streams, setStreams] = useState<MonetizationStream[]>(() =>
    loadFromStorage('streams', INITIAL_MONETIZATION_STREAMS)
  );
  const [projects, setProjects] = useState<WorkProject[]>(() =>
    loadFromStorage('projects', INITIAL_PROJECTS)
  );
  const [syncedAIs, setSyncedAIs] = useState<SyncedAIModel[]>(() =>
    loadFromStorage('syncedAIs', INITIAL_SYNCED_AIS)
  );
  const [personalSync, setPersonalSync] = useState<PersonalSyncState>(() =>
    loadFromStorage('personalSync', INITIAL_PERSONAL_SYNC)
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage('messages', INITIAL_MESSAGES)
  );
  const [connectedApps, setConnectedApps] = useState<ConnectedAppItem[]>(() =>
    loadFromStorage('connectedApps', INITIAL_CONNECTED_APPS)
  );
  const [tradeJournal, setTradeJournal] = useState<TradeJournalEntry[]>(() =>
    loadFromStorage('tradeJournal', INITIAL_TRADE_JOURNAL)
  );

  // Voice & Interaction states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [lastReply, setLastReply] = useState<string>(
    INITIAL_MESSAGES[0]?.spokenSummary || "Vampiee standing by on your desktop."
  );

  // Sync to localStorage
  useEffect(() => {
    saveToStorage('assets', assets);
  }, [assets]);

  useEffect(() => {
    saveToStorage('streams', streams);
  }, [streams]);

  useEffect(() => {
    saveToStorage('projects', projects);
  }, [projects]);

  useEffect(() => {
    saveToStorage('syncedAIs', syncedAIs);
  }, [syncedAIs]);

  useEffect(() => {
    saveToStorage('personalSync', personalSync);
  }, [personalSync]);

  useEffect(() => {
    saveToStorage('messages', messages);
  }, [messages]);

  useEffect(() => {
    saveToStorage('avatarStyle', avatarStyle);
  }, [avatarStyle]);

  useEffect(() => {
    saveToStorage('connectedApps', connectedApps);
  }, [connectedApps]);

  useEffect(() => {
    saveToStorage('tradeJournal', tradeJournal);
  }, [tradeJournal]);

  // Aggregate Metrics
  const totalNetWorth = assets.reduce(
    (sum, a) => sum + a.quantity * a.currentPrice,
    0
  );
  const monthlyRevenue = streams.reduce(
    (sum, s) => sum + s.monthlyRevenue,
    0
  );
  const targetRevenue = streams.reduce(
    (sum, s) => sum + s.targetMonthlyRevenue,
    0
  ) || 15000;
  const pendingTasksCount = projects.reduce(
    (sum, p) => sum + p.tasks.filter((t) => !t.completed).length,
    0
  );

  // Primary Chat & Voice Handler
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const response = await fetch('/api/vampiee/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            context: {
              portfolio: {
                totalNetWorth,
                change24h: '+3.4%',
                allTimeGain: '+38.4%',
              },
              monetization: {
                monthlyRevenue,
                targetRevenue,
                activeStreamsCount: streams.length,
              },
              work: {
                activeProjectsCount: projects.length,
                pendingTasksCount,
              },
              syncedAIs: syncedAIs
                .filter((ai) => ai.status !== 'standby')
                .map((ai) => ai.name),
              personalSync: {
                wants: personalSync.wants,
                needs: personalSync.needs,
                currentMood: personalSync.currentMood,
                energyLevel: personalSync.energyLevel,
                thoughts: personalSync.thoughts,
              },
            },
          }),
        });

        const data = await response.json();

        if (data.reply) {
          const aiMsg: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            sender: 'vampiee',
            text: data.reply,
            spokenSummary: data.spokenSummary,
            suggestions: data.suggestions,
            timestamp: 'Just now',
          };

          setMessages((prev) => [...prev, aiMsg]);
          setLastReply(data.spokenSummary || data.reply);

          // Vocalize response via TTS
          if (data.spokenSummary) {
            speechService.speak(data.spokenSummary);
          } else {
            speechService.speak(data.reply.slice(0, 150));
          }
        }
      } catch (err: any) {
        console.error('Failed to send message:', err);
        const fallbackMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'vampiee',
          text: `I am maintaining local operations. Your portfolio stands at $${totalNetWorth.toLocaleString()} and monetization is $${monthlyRevenue.toLocaleString()}/mo. You declared you feel ${personalSync.currentMood}. How shall we proceed?`,
          timestamp: 'Just now',
          suggestions: [
            "Audit asset allocation",
            "Generate monetization plan",
            "Align with my current mood",
          ],
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [totalNetWorth, monthlyRevenue, targetRevenue, streams.length, projects.length, pendingTasksCount, syncedAIs, personalSync]
  );

  // Setup speech listener callbacks
  useEffect(() => {
    speechService.setCallbacks(
      (transcript: string, isFinal: boolean) => {
        if (isFinal && transcript.trim()) {
          handleSendMessage(transcript);
        }
      },
      (listening: boolean, speaking: boolean) => {
        setIsListening(listening);
        setIsSpeaking(speaking);
      }
    );
  }, [handleSendMessage]);

  const handleToggleMic = () => {
    if (isListening) {
      speechService.stopListening();
    } else {
      speechService.startListening();
    }
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
  };

  // Personal Sync updates
  const handleUpdatePersonalSync = (updated: Partial<PersonalSyncState>) => {
    setPersonalSync((prev) => ({ ...prev, ...updated }));
  };

  const handleAskVampieeReflection = async (prompt: string) => {
    setActiveTab('chat');
    await handleSendMessage(prompt);
  };

  // AI Synchronization Handlers
  const handleToggleSyncAI = (id: string) => {
    setSyncedAIs((prev) =>
      prev.map((ai) =>
        ai.id === id
          ? { ...ai, status: ai.status === 'standby' ? 'synced' : 'standby' }
          : ai
      )
    );
  };

  const handleDispatchMission = async (
    objective: string,
    selectedModelNames: string[]
  ): Promise<string | null> => {
    setIsDispatching(true);
    try {
      const res = await fetch('/api/vampiee/sync-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          models: selectedModelNames,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        speechService.speak("Mission dispatched and synthesized across your AI fleet.");
        return data.plan;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDispatching(false);
    }
    return null;
  };

  // Investment Handlers
  const handleAddAsset = (newAsset: Omit<InvestmentAsset, 'id'>) => {
    const asset: InvestmentAsset = {
      ...newAsset,
      id: `inv-${Date.now()}`,
    };
    setAssets((prev) => [asset, ...prev]);
    speechService.speak(`Added ${asset.symbol} to your investment vault.`);
  };

  const handleUpdateAsset = (id: string, updated: Partial<InvestmentAsset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAuditPortfolio = async (): Promise<string | null> => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/vampiee/portfolio-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets,
          totalNetWorth,
        }),
      });
      const data = await res.json();
      if (data.audit) {
        speechService.speak("Financial audit complete. Reviewing strategic asset allocation.");
        return data.audit;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
    return null;
  };

  // Monetization Handlers
  const handleAddStream = (newStream: Omit<MonetizationStream, 'id'>) => {
    const stream: MonetizationStream = {
      ...newStream,
      id: `mon-${Date.now()}`,
    };
    setStreams((prev) => [...prev, stream]);
    speechService.speak(`New monetization stream ${stream.name} registered.`);
  };

  const handleUpdateStream = (id: string, updated: Partial<MonetizationStream>) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const handleDeleteStream = (id: string) => {
    setStreams((prev) => prev.filter((s) => s.id !== id));
  };

  const handleGenerateBlueprint = async (params: {
    niche: string;
    currentIncome: number;
    targetIncome: number;
    existingAssets: string;
  }): Promise<string | null> => {
    setIsGeneratingBlueprint(true);
    try {
      const res = await fetch('/api/vampiee/monetization-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.strategy) {
        speechService.speak("Monetization strategy generated. Ready to scale your cashflow.");
        return data.strategy;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBlueprint(false);
    }
    return null;
  };

  // Work Handlers
  const handleAddProject = (newProject: Omit<WorkProject, 'id'>) => {
    const project: WorkProject = {
      ...newProject,
      id: `proj-${Date.now()}`,
    };
    setProjects((prev) => [project, ...prev]);
    speechService.speak(`Project ${project.title} initialized and added to queue.`);
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          tasks: proj.tasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: !task.completed }
              : task
          ),
        };
      })
    );
  };

  const handleAddTask = (projectId: string, task: Omit<WorkTask, 'id'>) => {
    const newTask: WorkTask = {
      ...task,
      id: `t-${Date.now()}`,
    };
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          tasks: [...proj.tasks, newTask],
        };
      })
    );
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleAddApp = (app: Omit<ConnectedAppItem, 'id'>) => {
    const newApp: ConnectedAppItem = {
      ...app,
      id: `app-${Date.now()}`,
    };
    setConnectedApps((prev) => [newApp, ...prev]);
    speechService.speak(`App ${newApp.name} linked and connected.`);
  };

  const handleUpdateApp = (updated: ConnectedAppItem) => {
    setConnectedApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDeleteApp = (id: string) => {
    setConnectedApps((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddTrade = (trade: Omit<TradeJournalEntry, 'id' | 'createdAt'>) => {
    const newTrade: TradeJournalEntry = {
      ...trade,
      id: `trade-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTradeJournal((prev) => [newTrade, ...prev]);
    speechService.speak(`Trade setup for ${newTrade.symbol} logged.`);
  };

  const handleDeleteTrade = (id: string) => {
    setTradeJournal((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#090a10] text-[#e2e8f0] overflow-hidden">
      {/* If in Desktop Overlay Icon mode, render DesktopSimulator */}
      {viewMode === 'desktop_overlay' ? (
        <DesktopSimulator
          onOpenStudio={() => setViewMode('studio')}
          onOpenTab={(tab) => {
            setActiveTab(tab);
            setViewMode('studio');
          }}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onToggleMic={handleToggleMic}
          onStopSpeaking={handleStopSpeaking}
          lastReply={lastReply}
          onSpeakCommand={handleSendMessage}
          isLoading={isLoading}
          portfolioNetWorth={totalNetWorth}
          monthlyRevenue={monthlyRevenue}
          pendingTasksCount={pendingTasksCount}
          syncedAIs={syncedAIs}
          avatarStyle={avatarStyle}
          onToggleAvatarStyle={setAvatarStyle}
          personalSync={personalSync}
          connectedApps={connectedApps}
        />
      ) : (
        /* Studio Command Mode */
        <div className="flex flex-col h-full overflow-hidden">
          <TopNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isListening={isListening}
            onToggleMic={handleToggleMic}
            isSpeaking={isSpeaking}
            onStopSpeaking={handleStopSpeaking}
            portfolioNetWorth={totalNetWorth}
            monthlyRevenue={monthlyRevenue}
            avatarStyle={avatarStyle}
            onToggleAvatarStyle={setAvatarStyle}
          />

          <main className="flex-1 p-4 md:p-6 overflow-hidden">
            {activeTab === 'chat' && (
              <VoiceChatView
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isListening={isListening}
                isSpeaking={isSpeaking}
                onToggleMic={handleToggleMic}
                onStopSpeaking={handleStopSpeaking}
                portfolio={{
                  totalNetWorth,
                  change24h: '+3.4%',
                  allTimeGain: '+38.4%',
                }}
                monetization={{
                  monthlyRevenue,
                  targetRevenue,
                  activeStreamsCount: streams.length,
                }}
                work={{
                  activeProjectsCount: projects.length,
                  pendingTasksCount,
                }}
                syncedAIs={syncedAIs}
                avatarStyle={avatarStyle}
              />
            )}

            {activeTab === 'apps' && (
              <AppsTradingHubView
                apps={connectedApps}
                onAddApp={handleAddApp}
                onUpdateApp={handleUpdateApp}
                onDeleteApp={handleDeleteApp}
                tradeJournal={tradeJournal}
                onAddTrade={handleAddTrade}
                onDeleteTrade={handleDeleteTrade}
              />
            )}

            {activeTab === 'music' && (
              <DailyMusicStudioView
                personalSync={personalSync}
                onVocalize={(text) => speechService.speak(text)}
              />
            )}

            {activeTab === 'contacts' && (
              <ContactsView
                onAskVampieeOutreach={handleAskVampieeReflection}
                isLoadingVampiee={isLoading}
              />
            )}

            {activeTab === 'mind_sync' && (
              <PersonalSyncView
                personalSync={personalSync}
                onUpdatePersonalSync={handleUpdatePersonalSync}
                onAskVampieeReflection={handleAskVampieeReflection}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'ai_sync' && (
              <AISyncHubView
                syncedAIs={syncedAIs}
                onToggleSync={handleToggleSyncAI}
                onDispatchMission={handleDispatchMission}
                isDispatching={isDispatching}
                portfolioNetWorth={totalNetWorth}
                monthlyRevenue={monthlyRevenue}
              />
            )}

            {activeTab === 'investments' && (
              <InvestmentVaultView
                assets={assets}
                onAddAsset={handleAddAsset}
                onUpdateAsset={handleUpdateAsset}
                onDeleteAsset={handleDeleteAsset}
                onAuditPortfolio={handleAuditPortfolio}
                isAuditing={isAuditing}
              />
            )}

            {activeTab === 'monetization' && (
              <MonetizationEngineView
                streams={streams}
                onAddStream={handleAddStream}
                onUpdateStream={handleUpdateStream}
                onDeleteStream={handleDeleteStream}
                onGenerateBlueprint={handleGenerateBlueprint}
                isGeneratingBlueprint={isGeneratingBlueprint}
              />
            )}

            {activeTab === 'work' && (
              <WorkCommandView
                projects={projects}
                onAddProject={handleAddProject}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onDeleteProject={handleDeleteProject}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
