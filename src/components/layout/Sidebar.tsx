import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  FileCheck, 
  Eye, 
  UsersRound, 
  GraduationCap, 
  Calendar, 
  Compass, 
  Clock, 
  BarChart3, 
  FileText, 
  FileSpreadsheet, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { Role } from '../../types';
import { useI18n } from '../../i18n';

export type NavItemKey = 
  | 'dashboard'
  | 'enseignants'
  | 'etablissements'
  | 'inspections'
  | 'visites'
  | 'rencontres'
  | 'formations'
  | 'activites'
  | 'planification'
  | 'itineraires'
  | 'calendrier'
  | 'statistiques'
  | 'rapports'
  | 'import'
  | 'parametres'
  | 'inspecteurs';

interface SidebarProps {
  currentTab?: NavItemKey;
  activeTab?: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  collapsed?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
  urgentCount?: number;
  stats?: {
    enseignantsCount?: number;
    etablissementsCount?: number;
    inspectionsCount?: number;
    urgentCount?: number;
  };
  userRole?: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  collapsed,
  isCollapsed,
  onToggleCollapse,
  urgentCount,
  stats,
  userRole = 'admin'
}) => {
  const { t } = useI18n();
  const effectiveTab = currentTab || activeTab || 'dashboard';
  const effectiveCollapsed = isCollapsed ?? collapsed ?? false;
  const effectiveUrgent = stats?.urgentCount ?? urgentCount ?? 0;

  const navSections = [
    {
      title: t('pilotage'),
      items: [
        { key: 'dashboard' as NavItemKey, label: t('dashboard'), icon: LayoutDashboard },
        { 
          key: 'planification' as NavItemKey, 
          label: t('planning'), 
          icon: Clock, 
          badge: effectiveUrgent > 0 ? effectiveUrgent : undefined,
          badgeColor: 'bg-rose-500 text-white' 
        },
        { key: 'itineraires' as NavItemKey, label: t('routes'), icon: Compass },
        { key: 'calendrier' as NavItemKey, label: t('calendar'), icon: Calendar },
        { key: 'statistiques' as NavItemKey, label: t('statistics'), icon: BarChart3 },
      ]
    },
    {
      title: t('directories'),
      items: [
        { key: 'enseignants' as NavItemKey, label: t('teachers'), icon: Users },
        { key: 'etablissements' as NavItemKey, label: t('schools'), icon: School },
      ]
    },
    {
      title: t('pedagogicalActions'),
      items: [
        { key: 'inspections' as NavItemKey, label: t('inspections'), icon: FileCheck },
        { key: 'visites' as NavItemKey, label: t('visits'), icon: Eye },
        { key: 'rencontres' as NavItemKey, label: t('meetings'), icon: UsersRound },
        { key: 'formations' as NavItemKey, label: t('trainings'), icon: GraduationCap },
        { key: 'activites' as NavItemKey, label: t('activities'), icon: LayoutDashboard },
      ]
    },
    {
      title: t('editionData'),
      items: [
        { key: 'rapports' as NavItemKey, label: t('reports'), icon: FileText },
        { key: 'import' as NavItemKey, label: t('import'), icon: FileSpreadsheet },
        ...(userRole === 'admin' ? [{ key: 'inspecteurs' as NavItemKey, label: t('inspectors'), icon: UserCheck }] : []),
        ...(userRole === 'admin' ? [{ key: 'parametres' as NavItemKey, label: t('settings'), icon: Settings }] : []),
      ]
    }
  ];

  return (
    <aside
      id="app-sidebar"
      className={`relative flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 select-none z-30 ${
        effectiveCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
        {!effectiveCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20 shrink-0">
              <School className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-sm tracking-tight truncate">Suivi Pédagogique</span>
              
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
            <School className="w-5 h-5 text-white" />
          </div>
        )}

        <button
          id="toggle-sidebar-btn"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={effectiveCollapsed ? 'Développer la barre latérale' : 'Réduire la barre latérale'}
        >
          {effectiveCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Badge */}
      {!effectiveCollapsed && (
        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Mode actif:</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] uppercase tracking-wider ${
            userRole === 'admin' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : userRole === 'inspecteur'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-slate-700 text-slate-300'
          }`}>
            {userRole}
          </span>
        </div>
      )}

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5 scrollbar-thin">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!effectiveCollapsed && (
              <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = effectiveTab === item.key;
                return (
                  <button
                    key={item.key}
                    id={`nav-item-${item.key}`}
                    onClick={() => onSelectTab(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                    title={effectiveCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`} />
                    
                    {!effectiveCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!effectiveCollapsed && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                        {item.badge}
                      </span>
                    )}

                    {effectiveCollapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!effectiveCollapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="truncate">
            <p className="font-semibold text-slate-400">Direction Provinciale</p>
            <p className="truncate">Inzegane Aït Melloul - MEN</p>
          </div>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">v2.0</span>
        </div>
      )}
    </aside>
  );
};
