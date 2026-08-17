import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Radar,
  TrendingUp,
  Settings,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Cpu,
  Sparkles,
  RefreshCw,
  Clock,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Bell,
  GitBranch,
  Save,
  CheckCircle2,
  Loader2,
  Users,
  ShieldAlert,
  UserPlus,
  Plus,
  Trash2,
  ExternalLink,
  GitFork,
  Filter,
  Download,
  Terminal,
  HardDrive,
  Server,
  FolderKanban,
  Info,
  GitCommit,
  CheckCheck,
  UserX,
  UserMinus,
  Lock,
  ChevronLeft,
  Minus,
  BarChart3,
  Network,
  GitPullRequest
} from 'lucide-react';
import { useSession } from '../lib/auth-client.js';
import PrScanModal from '../components/PrScanModal.jsx';
import KnowledgeGraphView from '../components/KnowledgeGraphView.jsx';
import RefactorModal from '../components/RefactorModal.jsx';
import ShapExplainerModal from '../components/ShapExplainerModal.jsx';
import BusFactorDrawer from '../components/BusFactorDrawer.jsx';
import BranchDiagnosticsModal from '../components/BranchDiagnosticsModal.jsx';
import AlertPolicyModal from '../components/AlertPolicyModal.jsx';
import TechDebtQuadrantMatrix from '../components/TechDebtQuadrantMatrix.jsx';

import {
  fetchUserProfile,
  fetchUserDetailsApi,
  updateUserProfile,
  fetchDashboardSummary,
  fetchAllUsers,
  updateUserRoleApi,
  createUserByAdminApi,
  toggleUserDisableApi,
  deleteUserApi,
  fetchRepositories,
  addRepositoryApi,
  deleteRepositoryApi,
  fetchSystemTelemetry,
  getExportReportUrl,
  fetchOrganizations,
  createOrganizationApi,
  fetchProjects,
  createProjectApi,
  fetchNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  fetchCommitsApi,
  fetchHotspotsApi,
  rescanCodebaseApi,
  fetchRiskRadarApi,
  scanPullRequestApi,
  fetchShapExplanationApi,
  fetchBusFactorMetricsApi,
  fetchAlertPoliciesApi,
  updateAlertPolicyApi,
  runBranchDiagnosticsApi
} from '../lib/api.js';

const Dashboard = ({ onNavigateToLanding }) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('sentinel/core-engine');

  // Modal States for Phase 2, 3 & 4 Extension Modules
  const [showPrScanModal, setShowPrScanModal] = useState(false);
  const [refactorModalData, setRefactorModalData] = useState({ isOpen: false, filePath: '', complexityScore: 18.5 });
  const [shapModalData, setShapModalData] = useState({ isOpen: false, filePath: '', riskScore: 84 });
  const [showBusFactorDrawer, setShowBusFactorDrawer] = useState(false);
  const [showBranchDiagModal, setShowBranchDiagModal] = useState(false);
  const [showAlertPolicyModal, setShowAlertPolicyModal] = useState(false);

  // Profile Management State for Settings Tab
  const [profileData, setProfileData] = useState({
    firstName: session?.user?.name ? session.user.name.split(' ')[0] : '',
    lastName: session?.user?.name ? session.user.name.split(' ').slice(1).join(' ') : '',
    email: session?.user?.email || '',
    phone: '',
    role: session?.user?.email?.toLowerCase() === 'vivekmohanraj5@gmail.com' ? 'Admin' : 'Software Engineer (Developer)',
    image: session?.user?.image || ''
  });

  const [weeklyReports, setWeeklyReports] = useState(true);
  const [githubSync, setGithubSync] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Admin User & Role Management State
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [userRoleMessage, setUserRoleMessage] = useState(null);

  // Admin Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Software Engineer (Developer)');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [addUserError, setAddUserError] = useState(null);

  // User Details Inspection View State
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);

  // Repository Management State
  const [dbRepos, setDbRepos] = useState([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [isAddingRepo, setIsAddingRepo] = useState(false);
  const [repoMsg, setRepoMsg] = useState(null);
  const [showAddRepoModal, setShowAddRepoModal] = useState(false);

  // Project & Organization State
  const [orgsList, setOrgsList] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Notifications & Alert Center State
  const [notificationsList, setNotificationsList] = useState([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const unreadCount = notificationsList.filter((n) => !n.is_read).length;

  // Risk & Pattern Filter State
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING'
  const [patternFilter, setPatternFilter] = useState('ALL'); // 'ALL' | 'FACADE' | 'REPOSITORY' | 'MIDDLEWARE'

  // Telemetry & Logs State for Admin
  const [telemetryData, setTelemetryData] = useState(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);

  const isAdmin = profileData.role === 'Admin' || (profileData.email && profileData.email.toLowerCase() === 'vivekmohanraj5@gmail.com');
  const isManager = profileData.role === 'Engineering Manager (Project owner)' || profileData.role === 'Engineering Manager' || profileData.role === 'Tech Lead';
  const isDeveloper = !isAdmin && !isManager;

  // Commit Records & Developer Activity State
  const [commitsList, setCommitsList] = useState([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [commitSearch, setCommitSearch] = useState('');

  // Module Complexity & Hotspots State
  const [hotspotsList, setHotspotsList] = useState([]);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanMessage, setRescanMessage] = useState(null);

  // Risk Radar Predictions State
  const [riskPredictions, setRiskPredictions] = useState([]);
  const [isLoadingRiskRadar, setIsLoadingRiskRadar] = useState(false);

  // Sidebar Items
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Repositories', label: 'Repositories', icon: FolderGit2 },
    { id: 'Commits', label: 'Commits Log', icon: GitCommit },
    { id: 'Risk Radar', label: 'Risk Radar', icon: Radar },
    { id: 'Tech Debt', label: 'Tech Debt', icon: TrendingUp },
    { id: 'Knowledge Graph', label: 'Knowledge Graph', icon: Network },
    ...((isAdmin || isManager)
      ? [
          { id: 'Users', label: 'User Directory', icon: Users }
        ]
      : []),
    ...(isAdmin
      ? [
          { id: 'Telemetry', label: 'System Logs', icon: Terminal }
        ]
      : []),
    { id: 'Settings', label: 'Settings', icon: Settings }
  ];

  // Fetch real profile data from database on mount & session change
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const userEmail = session?.user?.email;
        const data = await fetchUserProfile(userEmail);
        if (isMounted && data) {
          const defaultFirstName = session?.user?.name ? session.user.name.split(' ')[0] : '';
          const defaultLastName = session?.user?.name ? session.user.name.split(' ').slice(1).join(' ') : '';

          setProfileData({
            firstName: data.firstName || defaultFirstName || '',
            lastName: data.lastName || defaultLastName || '',
            email: data.email || userEmail || '',
            phone: data.phone || '',
            role: data.role || (userEmail?.toLowerCase() === 'vivekmohanraj5@gmail.com' ? 'Admin' : 'Software Engineer (Developer)'),
            image: data.image || session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.firstName || userEmail || 'User')}&background=b7f15b&color=223600&bold=true`
          });
          setWeeklyReports(data.weeklyReports !== false);
          setGithubSync(data.githubSync !== false);
        }
      } catch (err) {
        console.warn('Using session fallback profile data:', err);
        if (session?.user && isMounted) {
          const parts = (session.user.name || '').split(' ');
          setProfileData((prev) => ({
            ...prev,
            firstName: parts[0] || prev.firstName,
            lastName: parts.slice(1).join(' ') || prev.lastName,
            email: session.user.email || prev.email,
            image: session.user.image || prev.image
          }));
        }
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [session]);

  // Fetch dashboard metrics summary from backend
  useEffect(() => {
    let isMounted = true;
    const loadSummary = async () => {
      try {
        const data = await fetchDashboardSummary(selectedRepo);
        if (isMounted && data) {
          setDashboardData(data);
        }
      } catch (err) {
        console.warn('Dashboard summary fetch fallback:', err);
      }
    };
    loadSummary();
    return () => { isMounted = false; };
  }, [selectedRepo]);

  // Fetch all registered users for Admin & Manager User Directory panel
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'Users' && (isAdmin || isManager)) {
      const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const list = await fetchAllUsers(profileData.email);
          if (isMounted && list) {
            setUsersList(list);
          }
        } catch (err) {
          console.error('Failed to load user directory:', err);
        } finally {
          if (isMounted) setIsLoadingUsers(false);
        }
      };
      loadUsers();
    }
    return () => { isMounted = false; };
  }, [activeTab, isAdmin, isManager, profileData.email]);

  // Fetch repositories from database filtered by selected project
  useEffect(() => {
    let isMounted = true;
    const loadRepos = async () => {
      setIsLoadingRepos(true);
      try {
        const list = await fetchRepositories(selectedProject);
        if (isMounted && list) {
          setDbRepos(list || []);
          if (list.length > 0) {
            const hasSelectedInList = list.some(r => r.name === selectedRepo);
            if (!hasSelectedInList) {
              setSelectedRepo(list[0].name);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load repositories:', err);
      } finally {
        if (isMounted) setIsLoadingRepos(false);
      }
    };
    loadRepos();
    return () => { isMounted = false; };
  }, [activeTab, selectedProject]);

  // Fetch Organizations from PostgreSQL on mount
  useEffect(() => {
    let isMounted = true;
    const loadOrgs = async () => {
      try {
        const list = await fetchOrganizations();
        if (isMounted && list) {
          setOrgsList(list || []);
          if (list.length > 0 && !selectedOrg) setSelectedOrg(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load organizations:', err);
      }
    };
    loadOrgs();
    return () => { isMounted = false; };
  }, []);

  // Fetch Projects from database on org change & tab changes
  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      try {
        const list = await fetchProjects(selectedOrg);
        if (isMounted && list) {
          setProjectsList(list || []);
          if (list.length > 0 && !selectedProject) setSelectedProject(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
    return () => { isMounted = false; };
  }, [activeTab, selectedOrg]);

  // Sync Project Dropdown selection when Repository selection changes
  useEffect(() => {
    if (selectedRepo && projectsList.length > 0) {
      const matchedProj = projectsList.find(
        (p) => p.name.toLowerCase() === selectedRepo.toLowerCase() || p.name.toLowerCase().includes(selectedRepo.toLowerCase())
      );
      if (matchedProj) {
        setSelectedProject(matchedProj.id);
      }
    }
  }, [selectedRepo, projectsList]);

  // Fetch Hotspots from database when Tech Debt tab opens
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'Tech Debt') {
      const loadHotspots = async () => {
        setIsLoadingHotspots(true);
        try {
          const list = await fetchHotspotsApi(selectedRepo);
          if (isMounted && list) setHotspotsList(list || []);
        } catch (err) {
          console.error('Failed to load hotspots:', err);
        } finally {
          if (isMounted) setIsLoadingHotspots(false);
        }
      };
      loadHotspots();
    }
    return () => { isMounted = false; };
  }, [activeTab, selectedRepo]);

  // Fetch Risk Radar predictions when Risk Radar tab opens
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'Risk Radar') {
      const loadRiskRadar = async () => {
        setIsLoadingRiskRadar(true);
        try {
          const list = await fetchRiskRadarApi(selectedRepo);
          if (isMounted && list) setRiskPredictions(list || []);
        } catch (err) {
          console.error('Failed to load risk predictions:', err);
        } finally {
          if (isMounted) setIsLoadingRiskRadar(false);
        }
      };
      loadRiskRadar();
    }
    return () => { isMounted = false; };
  }, [activeTab, selectedRepo]);

  // Fetch Commits from database when Commits tab opens or selectedRepo changes
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'Commits') {
      const loadCommits = async () => {
        setIsLoadingCommits(true);
        try {
          const list = await fetchCommitsApi(commitSearch, selectedRepo);
          if (isMounted && list) setCommitsList(list || []);
        } catch (err) {
          console.error('Failed to load commits:', err);
        } finally {
          if (isMounted) setIsLoadingCommits(false);
        }
      };
      loadCommits();
    }
    return () => { isMounted = false; };
  }, [activeTab, commitSearch, selectedRepo]);

  const handleRescanCodebase = async () => {
    setIsRescanning(true);
    setRescanMessage(null);
    try {
      const res = await rescanCodebaseApi(selectedRepo);
      if (res?.success) {
        setRescanMessage('Codebase rescan and static AST complexity analysis completed successfully.');
        const updatedHotspots = await fetchHotspotsApi(selectedRepo);
        if (updatedHotspots) setHotspotsList(updatedHotspots);
        setTimeout(() => setRescanMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to rescan codebase:', err);
    } finally {
      setIsRescanning(false);
    }
  };

  const handleAddRepo = async (e) => {
    e.preventDefault();
    if (!newRepoName || !newRepoUrl) return;
    setIsAddingRepo(true);
    setRepoMsg(null);
    try {
      const created = await addRepositoryApi(newRepoName, newRepoUrl);
      if (created) {
        const updatedList = await fetchRepositories();
        setDbRepos(updatedList || [created, ...dbRepos]);
        setSelectedRepo(created.name);
        setRepoMsg(`Repository ${created.name} linked and selected! Rescanning metrics...`);
        setNewRepoName('');
        setNewRepoUrl('');
        setShowAddRepoModal(false);
        await rescanCodebaseApi(created.id);
        const updatedHotspots = await fetchHotspotsApi(created.id);
        if (updatedHotspots) setHotspotsList(updatedHotspots);
        setTimeout(() => setRepoMsg(null), 5000);
      }
    } catch (err) {
      console.error('Failed to add repository:', err);
    } finally {
      setIsAddingRepo(false);
    }
  };

  const handleDeleteRepo = async (repoId, repoName) => {
    try {
      await deleteRepositoryApi(repoId);
      setDbRepos((prev) => prev.filter((r) => r.id !== repoId));
      setRepoMsg(`Repository ${repoName} unlinked.`);
      setTimeout(() => setRepoMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete repository:', err);
    }
  };

  const handleRoleUpdate = async (userId, userEmail, newRole) => {
    setUpdatingUserId(userId);
    setUserRoleMessage(null);
    try {
      const updated = await updateUserRoleApi(userId, newRole, profileData.email);
      if (updated) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
        setUserRoleMessage(`Role updated to "${updated.role}" for ${userEmail}.`);
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleAdminAddUser = async (e) => {
    e.preventDefault();
    setAddUserError(null);
    if (!newUserName || !newUserEmail || !newUserPassword) return;
    setIsCreatingUser(true);
    try {
      const created = await createUserByAdminApi(
        { name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole },
        profileData.email
      );
      if (created) {
        setUsersList([created, ...usersList]);
        setUserRoleMessage(`User account created for ${created.email}.`);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setShowAddUserModal(false);
      }
    } catch (err) {
      setAddUserError(err.message || 'Failed to create user account.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleUserDisable = async (userId, currentIsDisabled, userEmail) => {
    setUpdatingUserId(userId);
    try {
      const updated = await toggleUserDisableApi(userId, !currentIsDisabled, profileData.email);
      if (updated) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, isDisabled: updated.isDisabled } : u)));
        setUserRoleMessage(`Account for ${userEmail} is now ${updated.isDisabled ? 'DISABLED' : 'ACTIVE'}.`);
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle user status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleInspectUserDetail = async (targetUser) => {
    if (targetUser.email.toLowerCase() === profileData.email.toLowerCase()) {
      setActiveTab('Settings');
      return;
    }
    setIsLoadingUserDetail(true);
    try {
      const details = await fetchUserDetailsApi(targetUser.id, profileData.email);
      if (details) {
        setSelectedUserDetail(details);
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
      alert(err.message || 'Failed to inspect user details.');
    } finally {
      setIsLoadingUserDetail(false);
    }
  };

  // Save changes to database via PUT endpoint
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const activeEmail = session?.user?.email || profileData.email;
      const updated = await updateUserProfile(
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: activeEmail,
          phone: profileData.phone,
          role: profileData.role,
          weeklyReports,
          githubSync
        },
        activeEmail
      );

      if (updated) {
        setProfileData({
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          phone: updated.phone,
          role: updated.role
        });
        setWeeklyReports(updated.weeklyReports);
        setGithubSync(updated.githubSync);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Error saving profile changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // High-Risk Modules Data
  const highRiskModules = dashboardData?.highRiskModules || [
    {
      path: 'src/auth/session.ts',
      riskScore: 84,
      churnLevel: 'High Churn (+420 lines)',
      status: 'Critical'
    },
    {
      path: 'src/api/payment_gateway.go',
      riskScore: 72,
      churnLevel: 'Unresolved State Retry',
      status: 'Warning'
    },
    {
      path: 'src/engine/planner.rs',
      riskScore: 61,
      churnLevel: 'Complex Cyclomatic Growth',
      status: 'Elevated'
    },
    {
      path: 'src/db/migrations/v4.sql',
      riskScore: 48,
      churnLevel: 'Schema Coupling Impact',
      status: 'Moderate'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0d0b] text-[#dfe4de] font-sans antialiased flex flex-col md:flex-row selection:bg-[#b7f15b]/30 selection:text-[#b7f15b]">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[#181d1a] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateToLanding}>
          <div className="w-9 h-9 rounded-xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-bold text-lg tracking-wider uppercase text-[#dfe4de]">Sentinel</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="min-w-[48px] min-h-[48px] p-2 flex items-center justify-center rounded-xl bg-[#1c211e] border border-white/10 text-[#dfe4de] hover:bg-white/10 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION (Constraint: Exactly 5 Primary Items) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#181d1a] border-r border-white/10 flex flex-col justify-between p-6 z-50 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              if (onNavigateToLanding) onNavigateToLanding();
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#b7f15b]/15 border border-[#b7f15b]/40 flex items-center justify-center text-[#b7f15b] group-hover:scale-105 transition-transform">
              <Radar className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-xl tracking-wider uppercase text-[#dfe4de] group-hover:text-[#b7f15b] transition-colors">
                Sentinel
              </div>
              <div className="text-[10px] font-mono text-[#c3c9b2] tracking-widest uppercase">
                Code Analytics Node
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full min-h-[48px] px-4 py-3 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-3 transition-all duration-200 ${
                    isActive
                      ? 'bg-[#b7f15b] text-[#223600] font-bold shadow-lg shadow-[#b7f15b]/20 scale-[1.02]'
                      : 'text-[#c3c9b2] hover:text-[#dfe4de] hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#223600]' : 'text-[#8d937e]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Air-Gapped Security Badge */}
        <div className="p-4 rounded-2xl bg-[#1c211e] border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#b7f15b]">
            <ShieldCheck className="w-4 h-4 text-[#b7f15b]" />
            <span className="uppercase tracking-wider">Air-Gapped Node</span>
          </div>
          <p className="text-[11px] text-[#c3c9b2] leading-relaxed">
            Local static AST analysis active. 0 external network requests emitted.
          </p>
          <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#8d937e] border-t border-white/5">
            <span>MODEL 4.2-LOCAL</span>
            <span className="text-[#92d957]">99.8% READY</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-6 md:p-10 space-y-8 overflow-y-auto">
        {/* TOP BAR / HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-[#dfe4de] tracking-tight">
                {activeTab === 'Dashboard' && 'Predictive Command Center'}
                {activeTab === 'Repositories' && 'Repository Graph Index'}
                {activeTab === 'Commits' && 'Commit Log & Developer Churn Activity'}
                {activeTab === 'Risk Radar' && 'Real-Time Telemetry Matrix'}
                {activeTab === 'Tech Debt' && 'Architectural Degradation Analysis'}
                {activeTab === 'Users' && 'User & Role Management Directory'}
                {activeTab === 'Telemetry' && 'System Execution & Telemetry Logs'}
                {activeTab === 'Settings' && 'Profile & Workspace Preferences'}
              </h1>
              <span className="px-3 py-1 rounded-full bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] text-xs font-mono font-bold uppercase tracking-wider shrink-0">
                Live Scan Active
              </span>
            </div>
            <p className="text-sm text-[#c3c9b2]/70 mt-1 font-mono">
              Engineering Knowledge Graph analysis for Sprint 42
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            {/* Organization Selector */}
            <div className="relative shrink-0">
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="h-10 px-3 pr-8 rounded-xl bg-[#1c211e] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors cursor-pointer appearance-none"
              >
                {orgsList.length === 0 && <option value="">org: Sentinel Engineering</option>}
                {orgsList.map((o) => (
                  <option key={o.id} value={o.id}>org: {o.name}</option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-[#8d937e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Project Selector */}
            <div className="relative shrink-0">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="h-10 px-3 pr-8 rounded-xl bg-[#1c211e] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors cursor-pointer appearance-none"
              >
                {projectsList.length === 0 && <option value="">proj: Main Engineering</option>}
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>proj: {p.name}</option>
                ))}
              </select>
              <FolderKanban className="w-4 h-4 text-[#8d937e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Repository Selector */}
            <div className="relative shrink-0">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="h-10 px-3 pr-8 rounded-xl bg-[#1c211e] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors cursor-pointer appearance-none"
              >
                {dbRepos.length === 0 && <option value="sentinel/core-engine">repo: sentinel/core-engine</option>}
                {dbRepos.map((r) => (
                  <option key={r.id} value={r.name}>repo: {r.name}</option>
                ))}
              </select>
              <FolderGit2 className="w-4 h-4 text-[#8d937e] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Add Project & Rescan Codebase Buttons (Admin & Manager Only) */}
            {(isAdmin || isManager) && (
              <>
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="h-10 px-3.5 rounded-xl bg-[#1c211e] border border-white/10 text-[#dfe4de] hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-xs font-mono uppercase shrink-0"
                  title="Create New Project"
                >
                  <Plus className="w-4 h-4 text-[#b7f15b]" />
                  <span className="inline">New Project</span>
                </button>

                <button
                  onClick={handleRescanCodebase}
                  disabled={isRescanning}
                  className="h-10 px-3.5 rounded-xl bg-[#1c211e] border border-white/10 text-[#dfe4de] hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-xs font-mono uppercase shrink-0"
                  title="Rescan Codebase Complexity & Churn"
                >
                  <RefreshCw className={`w-4 h-4 text-[#b7f15b] ${isRescanning ? 'animate-spin' : ''}`} />
                  <span className="inline">{isRescanning ? 'Scanning...' : 'Rescan Codebase'}</span>
                </button>
              </>
            )}

            {/* PR Pre-Merge Risk Scanner Button */}
            <button
              onClick={() => setShowPrScanModal(true)}
              className="h-10 px-3.5 rounded-xl bg-[#1c211e] border border-[#b7f15b]/30 text-[#b7f15b] hover:bg-[#b7f15b]/10 transition-all flex items-center gap-2 text-xs font-mono font-bold uppercase shrink-0"
              title="Run Automated Pull Request Pre-Merge Risk Scan"
            >
              <GitPullRequest className="w-4 h-4 text-[#b7f15b]" />
              <span className="inline">PR Scan</span>
            </button>

            {/* Export CSV Report Button */}
            <a
              href={getExportReportUrl('csv')}
              download="sentinel-report.csv"
              className="h-10 px-3.5 rounded-xl bg-[#1c211e] border border-[#b7f15b]/30 text-[#b7f15b] hover:bg-[#b7f15b]/10 transition-all flex items-center gap-2 text-xs font-mono font-bold uppercase shrink-0"
              title="Download Executive Engineering CSV Report"
            >
              <Download className="w-4 h-4 text-[#b7f15b]" />
              <span className="inline">Export Report</span>
            </a>

            {/* Notification Bell Button */}
            <button
              onClick={() => setShowNotificationDrawer(true)}
              className="relative h-10 w-10 rounded-xl bg-[#1c211e] border border-white/10 text-[#dfe4de] hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center shrink-0"
              title="Open System Alerts & Notifications"
            >
              <Bell className="w-4 h-4 text-[#c3c9b2]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#b7f15b] text-[#223600] font-mono text-[10px] font-bold flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar Badge Button */}
            <button
              onClick={() => setActiveTab('Settings')}
              className="h-10 px-2.5 rounded-xl bg-[#1c211e] border border-white/10 text-[#dfe4de] hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2.5 shrink-0"
              title="View Profile Settings"
            >
              <img
                src={profileData.image || session?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.firstName || profileData.email || 'User')}&background=b7f15b&color=223600&bold=true`}
                alt={profileData.firstName || 'User Avatar'}
                className="w-7 h-7 rounded-lg object-cover border border-[#b7f15b]/40"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.firstName || profileData.email || 'User')}&background=b7f15b&color=223600&bold=true`;
                }}
              />
              <span className="text-xs font-mono font-semibold max-w-[100px] truncate hidden sm:inline text-[#dfe4de]">
                {profileData.firstName || profileData.email.split('@')[0]}
              </span>
            </button>
          </div>
        </header>

        {/* 1. DASHBOARD VIEW (MAIN BENTO GRID - DETERMINISTIC CODE QUALITY ANALYTICS & INTERACTIVE GRAPH ENGINE) */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* ROLE-SPECIFIC GOVERNANCE SCOPE BANNER */}
            <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-2 shrink-0 ${
                  isAdmin
                    ? 'bg-[#b7f15b]/15 text-[#b7f15b] border-[#b7f15b]/30'
                    : isManager
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-[#181d1a] text-[#dfe4de] border-white/15'
                }`}>
                  <ShieldCheck className="w-4 h-4 text-[#b7f15b]" />
                  <span>{isAdmin ? 'System Administrator Scope' : isManager ? 'Engineering Manager Scope' : 'Software Engineer Scope'}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#dfe4de]">
                    {isAdmin && 'Full Ingestion, User Management & System Control'}
                    {isManager && 'Team Sprint Telemetry, Bus Factor Risks & Team Health'}
                    {isDeveloper && 'Localized Branch Diagnostics & Personal Code Quality'}
                  </h3>
                  <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
                    {isAdmin && 'Access granted to system logs, repository management, and user role configuration.'}
                    {isManager && 'Access to team-level collaboration patterns, sprint completion telemetry, and bus factor risks.'}
                    {isDeveloper && 'Access to personal commit impact, branch co-change risk, and low-friction code quality diagnostics.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs text-[#8d937e] shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/5 w-full md:w-auto justify-between md:justify-end">
                <span>Account Role:</span>
                <span className="px-3 py-1 rounded-full bg-[#181d1a] border border-[#b7f15b]/30 text-[#b7f15b] font-bold">
                  {profileData.role}
                </span>
              </div>
            </div>

            {/* KPI STATS CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10 space-y-2 hover:border-[#b7f15b]/40 transition-all shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                  <span>MINED COMMITS</span>
                  <GitCommit className="w-4 h-4 text-[#b7f15b]" />
                </div>
                <div className="text-3xl font-bold text-[#dfe4de] font-mono">
                  {dashboardData?.totalCommits ?? 0}
                </div>
                <div className="text-[11px] text-[#8d937e]">Indexed in PostgreSQL</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10 space-y-2 hover:border-[#92d957]/40 transition-all shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                  <span>LINES ADDED</span>
                  <Plus className="w-4 h-4 text-[#92d957]" />
                </div>
                <div className="text-3xl font-bold text-[#92d957] font-mono">
                  +{dashboardData?.totalLinesAdded ?? 0}
                </div>
                <div className="text-[11px] text-[#8d937e]">Total code additions</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10 space-y-2 hover:border-[#ffb4ab]/40 transition-all shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                  <span>LINES DELETED</span>
                  <Minus className="w-4 h-4 text-[#ffb4ab]" />
                </div>
                <div className="text-3xl font-bold text-[#ffb4ab] font-mono">
                  -{dashboardData?.totalLinesDeleted ?? 0}
                </div>
                <div className="text-[11px] text-[#8d937e]">Refactored / removed</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c211e] border border-white/10 space-y-2 hover:border-amber-400/40 transition-all shadow-lg">
                <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                  <span>AVG COMPLEXITY</span>
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-amber-400 font-mono">
                  {dashboardData?.avgComplexityScore ?? '12.5'}
                </div>
                <div className="text-[11px] text-[#8d937e]">Cyclomatic complexity index</div>
              </div>
            </div>

            {/* MAIN ANALYTICS GRAPH ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* GRAPH 1: Real Commit Activity & Code Churn Time Series (SVG Area & Line Chart) */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-[#1c211e] border border-white/10 space-y-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#b7f15b]" />
                      <h2 className="text-lg font-semibold text-[#dfe4de]">Code Churn & Line Delta History</h2>
                    </div>
                    <p className="text-xs font-mono text-[#c3c9b2] mt-0.5">
                      Daily line additions vs refactored deletions for repository <span className="text-[#b7f15b] font-bold">{dashboardData?.repoName || selectedRepo}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#92d957]"></span>
                      <span className="text-[#dfe4de]">Additions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#ffb4ab]"></span>
                      <span className="text-[#dfe4de]">Deletions</span>
                    </div>
                  </div>
                </div>

                {/* SVG Visual Area Chart */}
                <div className="h-64 w-full relative pt-2">
                  {(!dashboardData?.timeSeries || dashboardData.timeSeries.length === 0) ? (
                    <div className="h-full flex items-center justify-center text-xs font-mono text-[#8d937e]">
                      Mining time series data from PostgreSQL...
                    </div>
                  ) : (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="addGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#92d957" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#92d957" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid background lines */}
                      <line x1="0" y1="40" x2="500" y2="40" stroke="white" strokeOpacity="0.05" strokeDasharray="3 3" />
                      <line x1="0" y1="90" x2="500" y2="90" stroke="white" strokeOpacity="0.05" strokeDasharray="3 3" />
                      <line x1="0" y1="140" x2="500" y2="140" stroke="white" strokeOpacity="0.05" strokeDasharray="3 3" />

                      {/* Render Additions Area Path */}
                      {(() => {
                        const ts = dashboardData.timeSeries;
                        const maxVal = Math.max(...ts.map(d => Math.max(d.added, d.deleted)), 100);
                        const getX = (i, total) => (total <= 1 ? 250 : (i / (total - 1)) * 460 + 20);

                        const pointsAdded = ts.map((d, i) => `${getX(i, ts.length)},${170 - (d.added / maxVal) * 140}`).join(' L ');
                        const pointsDeleted = ts.map((d, i) => `${getX(i, ts.length)},${170 - (d.deleted / maxVal) * 140}`).join(' L ');

                        const lastX = getX(ts.length - 1, ts.length);
                        const firstX = getX(0, ts.length);

                        const areaAdded = `M ${firstX},170 L ${pointsAdded} L ${lastX},170 Z`;
                        const areaDeleted = `M ${firstX},170 L ${pointsDeleted} L ${lastX},170 Z`;

                        return (
                          <>
                            <path d={areaAdded} fill="url(#addGrad)" />
                            <path d={areaDeleted} fill="url(#delGrad)" />

                            <path d={`M ${pointsAdded}`} fill="none" stroke="#92d957" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d={`M ${pointsDeleted}`} fill="none" stroke="#ffb4ab" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" />

                            {ts.map((d, i) => {
                              const x = getX(i, ts.length);
                              const yAdd = 170 - (d.added / maxVal) * 140;
                              const yDel = 170 - (d.deleted / maxVal) * 140;
                              return (
                                <g key={i} className="group/pt cursor-pointer">
                                  <circle cx={x} cy={yAdd} r="4" fill="#1c211e" stroke="#92d957" strokeWidth="2" />
                                  <circle cx={x} cy={yDel} r="3" fill="#1c211e" stroke="#ffb4ab" strokeWidth="2" />
                                  <text x={x} y="192" fill="#8d937e" fontSize="9" textAnchor="middle" fontFamily="monospace">{d.date}</text>
                                  <text x={x} y={yAdd - 8} fill="#92d957" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">+{d.added}</text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  )}
                </div>
              </div>

              {/* GRAPH 2: Module Cyclomatic Complexity Distribution Bar Chart */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1c211e] border border-white/10 space-y-6 shadow-xl relative flex flex-col justify-between">
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-semibold text-[#dfe4de]">Module Complexity Bar Chart</h2>
                  </div>
                  <p className="text-xs font-mono text-[#c3c9b2] mt-0.5">
                    Cyclomatic complexity distribution per file
                  </p>
                </div>

                <div className="space-y-3.5">
                  {(!dashboardData?.complexityDistribution || dashboardData.complexityDistribution.length === 0) ? (
                    <div className="text-xs font-mono text-[#8d937e]">Loading module metrics...</div>
                  ) : (
                    dashboardData.complexityDistribution.map((item, idx) => {
                      const maxComp = Math.max(...dashboardData.complexityDistribution.map(c => c.complexity), 20);
                      const pct = Math.round((item.complexity / maxComp) * 100);
                      const colorClass = item.complexity >= 16 ? 'bg-[#ffb4ab]' : item.complexity >= 12 ? 'bg-amber-400' : 'bg-[#92d957]';
                      const textColorClass = item.complexity >= 16 ? 'text-[#ffb4ab]' : item.complexity >= 12 ? 'text-amber-400' : 'text-[#92d957]';

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-[#dfe4de] font-semibold truncate max-w-[170px]" title={item.fullPath}>{item.path}</span>
                            <span className={`${textColorClass} font-bold`}>{item.complexity} score</span>
                          </div>
                          <div className="w-full bg-[#262b28] rounded-full h-2 overflow-hidden">
                            <div className={`${colorClass} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#262b28] border border-white/5 flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                  <span>Average Cyclomatic Score</span>
                  <span className="text-amber-400 font-bold">{dashboardData?.avgComplexityScore || '12.5'}</span>
                </div>
              </div>
            </div>

            {/* SECOND ANALYTICS ROW: CONTRIBUTOR LEADERBOARD & HIGH-RISK MODULES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* WIDGET 3: Role-Differentiated Contributor Analytics */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-[#1c211e] border border-white/10 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b]">
                      {isDeveloper ? <GitCommit className="w-5 h-5 text-[#b7f15b]" /> : <Users className="w-5 h-5 text-[#b7f15b]" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#dfe4de]">
                        {isDeveloper ? 'My Authored Activity & Churn' : 'Repository Commit Authors'}
                      </h2>
                      <p className="text-xs font-mono text-[#c3c9b2]">
                        {isDeveloper ? 'Personal commit records for active sprint' : 'Team contributor volume from PostgreSQL history'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#8d937e] uppercase font-bold">
                    {isDeveloper ? 'Personal' : 'Mined'}
                  </span>
                </div>

                <div className="space-y-3">
                  {isDeveloper ? (
                    /* DEVELOPER VIEW: ONLY PERSONAL COMMITS & PRIVACY SAFEGUARD */
                    (() => {
                      const myContrib = dashboardData?.contributors?.find(
                        (c) => c.email.toLowerCase() === profileData.email.toLowerCase()
                      ) || { email: profileData.email, name: profileData.firstName || 'Me', commits: 3, added: 420, deleted: 15 };

                      return (
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl bg-[#181d1a] border border-[#b7f15b]/30 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-[#b7f15b]/20 text-[#b7f15b] font-mono font-bold text-sm flex items-center justify-center shrink-0 border border-[#b7f15b]/40">
                                {(profileData.firstName || profileData.email)[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-mono text-xs text-[#dfe4de] font-bold flex items-center gap-2">
                                  <span>{myContrib.email}</span>
                                  <span className="px-2 py-0.5 rounded bg-[#b7f15b]/20 text-[#b7f15b] text-[10px]">Active Developer</span>
                                </div>
                                <div className="text-[11px] text-[#92d957] font-mono mt-0.5">
                                  +{myContrib.added} added / -{myContrib.deleted} deleted lines
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-base font-mono font-bold text-[#b7f15b]">{myContrib.commits} Commits</div>
                              <div className="text-[10px] text-[#8d937e] font-mono">This Sprint</div>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#262b28] border border-white/5 text-[11px] font-mono text-[#c3c9b2] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#b7f15b] shrink-0" />
                            <span>Privacy Enforced: Peer developer contribution rankings are hidden in Developer Scope.</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* MANAGER & ADMIN VIEW: TEAM CONTRIBUTOR AGGREGATIONS */
                    (!dashboardData?.contributors || dashboardData.contributors.length === 0) ? (
                      <div className="text-xs font-mono text-[#8d937e]">No contributor records mined yet.</div>
                    ) : (
                      dashboardData.contributors.map((contrib, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all">
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-full bg-[#b7f15b]/15 text-[#b7f15b] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#b7f15b]/30">
                              {contrib.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-mono text-xs text-[#dfe4de] font-semibold truncate">{contrib.email}</div>
                              <div className="text-[11px] text-[#8d937e] font-mono">
                                +{contrib.added} / -{contrib.deleted} lines
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-mono font-bold text-[#b7f15b]">{contrib.commits} Commits</div>
                            <div className="text-[10px] text-[#8d937e] font-mono font-bold">Team Volume</div>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>

              {/* WIDGET 4: High-Risk Module Failure Density (Mined Module Metrics) */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-[#1c211e] border border-white/10 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#ffb4ab]/10 text-[#ffb4ab]">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#dfe4de]">Architectural Failure Hotspots</h2>
                      <p className="text-xs font-mono text-[#c3c9b2]">Static AST complexity & churn metrics</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#8d937e] uppercase font-bold">Ranked</span>
                </div>

                <div className="space-y-3">
                  {(!dashboardData?.highRiskModules || dashboardData.highRiskModules.length === 0) ? (
                    <div className="text-xs font-mono text-[#8d937e]">No high-risk hotspots recorded.</div>
                  ) : (
                    dashboardData.highRiskModules.map((mod, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#181d1a] border border-white/5 flex items-center justify-between hover:border-white/20 transition-all">
                        <div className="space-y-1 min-w-0 pr-3">
                          <div className="font-mono text-xs text-[#dfe4de] font-semibold truncate">{mod.path}</div>
                          <div className="text-[11px] text-[#8d937e] font-mono">
                            Complexity: {mod.complexityScore || 14.5} | Churn: {mod.churnRate || 80} edits ({mod.bugFrequency || 2} bugs)
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                            mod.riskScore >= 75
                              ? 'bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30'
                              : mod.riskScore >= 60
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-[#92d957]/15 text-[#92d957] border border-[#92d957]/30'
                          }`}>
                            {mod.status.toUpperCase()} ({mod.riskScore}%)
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ROLE-TAILORED ANALYTICS SECTION (Adaptation based on RBAC User Role) */}
            {isDeveloper ? (
              /* DEVELOPER-CENTRIC DIAGNOSTICS & PERSONAL ACTIVITY CARD */
              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 space-y-5 shadow-xl animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b] border border-[#b7f15b]/30">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#dfe4de]">Developer Branch Diagnostics & Personal Activity</h2>
                      <p className="text-xs font-mono text-[#c3c9b2]">Localized code quality telemetry & low-friction co-change insights</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBranchDiagModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#b7f15b]/15 hover:bg-[#b7f15b]/25 border border-[#b7f15b]/30 text-[#b7f15b] text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <GitBranch className="w-4 h-4 text-[#b7f15b]" />
                    <span>Run Branch Pre-Check</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: My Commit History */}
                  <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                      <span>MY AUTHORED COMMITS</span>
                      <GitCommit className="w-4 h-4 text-[#b7f15b]" />
                    </div>
                    <div className="text-2xl font-bold text-[#b7f15b] font-mono">
                      {dashboardData?.contributors?.find(c => c.email.toLowerCase() === profileData.email.toLowerCase())?.commits || 3} Commits
                    </div>
                    <p className="text-[11px] font-mono text-[#8d937e]">Indexed in active sprint repository</p>
                  </div>

                  {/* Card 2: Co-Change Risk Diagnostic */}
                  <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                      <span>BRANCH CO-CHANGE RISK</span>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-sm font-bold text-amber-300 font-mono">
                      High Co-Dependence Detected
                    </div>
                    <p className="text-[11px] font-mono text-[#c3c9b2]/70">
                      Edits in <span className="text-[#b7f15b]">mainEngine.js</span> historically trigger changes in <span className="text-[#b7f15b]">stateManager.js</span>.
                    </p>
                  </div>

                  {/* Card 3: Pre-Merge Recommendation */}
                  <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                      <span>PRE-MERGE ADVISORY</span>
                      <Sparkles className="w-4 h-4 text-[#b7f15b]" />
                    </div>
                    <div className="text-sm font-bold text-[#dfe4de] font-mono">
                      Run Unit Tests on Eviction State
                    </div>
                    <p className="text-[11px] font-mono text-[#8d937e]">
                      Recommended before pushing PR to prevent downstream regressions.
                    </p>
                  </div>
                </div>

                {/* Non-Punitive Privacy Protection Safeguard Note */}
                <div className="p-3.5 rounded-xl bg-[#262b28] border border-white/5 flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#b7f15b] shrink-0" />
                    <span>Goodhart's Law Protection: Telemetry is aggregated at team level to prevent individual micromanagement.</span>
                  </div>
                  <span className="text-[#b7f15b] font-bold text-[10px] uppercase tracking-wider shrink-0">PROTECTED</span>
                </div>
              </div>
            ) : (
              /* MANAGER & ADMIN TEAM KNOWLEDGE & BUS FACTOR RISK MATRIX */
              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 space-y-5 shadow-xl animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#dfe4de]">Team Knowledge Concentration & Bus Factor Risks</h2>
                      <p className="text-xs font-mono text-[#c3c9b2]">Single-developer module dependencies & review workload balance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBusFactorDrawer(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Inspect Bus Factor Matrix</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bus Factor Risk 1 */}
                  <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                      <span>BUS FACTOR RISK</span>
                      <ShieldAlert className="w-4 h-4 text-[#ffb4ab]" />
                    </div>
                    <div className="text-base font-bold text-[#ffb4ab] font-mono">
                      Module mainEngine.js
                    </div>
                    <p className="text-[11px] font-mono text-[#c3c9b2]/70">
                      84% of modifications by single contributor (<span className="text-[#b7f15b]">lead_dev</span>). High dependency risk.
                    </p>
                  </div>

                  {/* Sprint Delivery Telemetry */}
                  <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                      <span>SPRINT VELOCITY RISK</span>
                      <Activity className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-base font-bold text-amber-300 font-mono">
                      Sprint 42 Completion: 88%
                    </div>
                    <p className="text-[11px] font-mono text-[#c3c9b2]/70">
                      Task-code velocity alignment on track. 2 PRs require additional reviewers.
                    </p>
                  </div>

                  {/* Manager Action Recommendation */}
                  <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]">
                      <span>MANAGER ACTION</span>
                      <UserPlus className="w-4 h-4 text-[#b7f15b]" />
                    </div>
                    <div className="text-base font-bold text-[#b7f15b] font-mono">
                      Assign Co-Reviewer
                    </div>
                    <p className="text-[11px] font-mono text-[#8d937e]">
                      Rebalance PR reviews across team members to broaden codebase knowledge.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SETTINGS TAB (REAL DATABASE CRUD INTEGRATION) */}
        {activeTab === 'Settings' && (
          <div className="max-w-4xl space-y-8 animate-fadeIn">
            {/* RBAC Read-Only Badge Header Card */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#dfe4de]">User Identity & Database Profile</h2>
                  <p className="text-xs font-mono text-[#c3c9b2] mt-0.5">
                    Synced with PostgreSQL table `tbl_user` via Express REST API.
                  </p>
                </div>
              </div>

              {/* READ-ONLY RBAC BADGE */}
              <div className="px-4 py-2 rounded-full bg-[#181d1a] border border-[#b7f15b]/30 text-[#b7f15b] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit">
                <ShieldCheck className="w-4 h-4 text-[#b7f15b]" />
                <span>Role: {profileData.role}</span>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] flex items-center gap-3 text-sm font-mono animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Database profile successfully updated in PostgreSQL!</span>
              </div>
            )}

            {/* Profile Management Form with Database Sync */}
            <form onSubmit={handleProfileSave} className="p-6 md:p-8 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#dfe4de]">Profile Details</h3>
                  <p className="text-xs text-[#c3c9b2] font-mono mt-1">
                    Manage identification and contact information stored in PostgreSQL.
                  </p>
                </div>
                {isLoadingProfile && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#b7f15b]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading DB Profile...</span>
                  </div>
                )}
              </div>
              {/* Profile Avatar Card Preview & Input */}
              <div className="p-4 rounded-xl bg-[#181d1a] border border-white/10 flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={profileData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.firstName || profileData.email || 'User')}&background=b7f15b&color=223600&bold=true`}
                  alt={profileData.firstName || 'Profile'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#b7f15b]/40 shadow-xl shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.firstName || profileData.email || 'User')}&background=b7f15b&color=223600&bold=true`;
                  }}
                />
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={profileData.image}
                    placeholder="https://example.com/avatar.jpg"
                    onChange={(e) => setProfileData({ ...profileData, image: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#1c211e] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b]"
                  />
                  <p className="text-[11px] font-mono text-[#8d937e]">
                    Google/GitHub OAuth image or custom profile picture link
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors"
                    required
                  />
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                    Phone Number <span className="text-[10px] text-[#8d937e] lowercase">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Role Selection (RBAC) */}
              <div>
                <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">
                  Access Control Role
                </label>
                <select
                  value={profileData.role}
                  onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                  disabled={isAdmin}
                  className="w-full min-h-[48px] px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="Admin">System Administrator (Super Admin)</option>
                  <option value="Engineering Manager (Project owner)">Engineering Manager (Project owner)</option>
                  <option value="Software Engineer (Developer)">Software Engineer (Developer)</option>
                </select>
                {isAdmin && (
                  <p className="text-[11px] font-mono text-[#b7f15b] mt-1.5">
                    Super Admin role is permanently enforced for vivekmohanraj5@gmail.com.
                  </p>
                )}
              </div>

              {/* UI TOGGLES */}
              <div className="border-t border-white/10 pt-6 space-y-4">
                <h4 className="text-sm font-mono uppercase text-[#c3c9b2] tracking-wider">
                  Notification & Synchronization Preferences
                </h4>

                {/* Toggle 1: Receive Weekly Risk Reports */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#181d1a] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#b7f15b]/10 text-[#b7f15b] shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#dfe4de]">Receive Weekly Risk Reports</div>
                      <div className="text-xs text-[#c3c9b2]/70">Automated static code quality summary delivered every Monday at 08:00 UTC.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeeklyReports(!weeklyReports)}
                    className={`w-14 h-8 p-1 rounded-full flex items-center transition-colors shrink-0 cursor-pointer ${
                      weeklyReports ? 'bg-[#b7f15b]' : 'bg-[#262b28] border border-white/10'
                    }`}
                    aria-label="Toggle weekly risk reports"
                  >
                    <div
                      className={`w-6 h-6 rounded-full transition-transform shadow-md ${
                        weeklyReports ? 'translate-x-6 bg-[#223600]' : 'translate-x-0 bg-[#8d937e]'
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Toggle 2: GitHub Sync */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#181d1a] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#92d957]/10 text-[#92d957] shrink-0">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#dfe4de]">GitHub Sync</div>
                      <div className="text-xs text-[#c3c9b2]/70">Real-time webhook ingestion for PR status changes & commit graphs.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGithubSync(!githubSync)}
                    className={`w-14 h-8 p-1 rounded-full flex items-center transition-colors shrink-0 cursor-pointer ${
                      githubSync ? 'bg-[#b7f15b]' : 'bg-[#262b28] border border-white/10'
                    }`}
                    aria-label="Toggle GitHub synchronization"
                  >
                    <div
                      className={`w-6 h-6 rounded-full transition-transform shadow-md ${
                        githubSync ? 'translate-x-6 bg-[#223600]' : 'translate-x-0 bg-[#8d937e]'
                      }`}
                    ></div>
                  </button>
                </div>
              </div>

              {/* SAVE CHANGES CTA BUTTON (Lower-thumb zone) */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 px-8 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#b7f15b]/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Updating Database...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. USER DIRECTORY TAB (ADMIN & MANAGER ACCESS) */}
        {activeTab === 'Users' && (isAdmin || isManager) && (
          <div className="space-y-6 animate-fadeIn">
            {/* If a user is selected for detailed inspection */}
            {selectedUserDetail ? (
              <div className="space-y-6">
                {/* Top Navigation & Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedUserDetail(null)}
                    className="h-10 px-4 rounded-xl bg-[#1c211e] border border-white/10 text-[#dfe4de] hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-mono uppercase"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#b7f15b]" />
                    <span>Back to Directory</span>
                  </button>
                  <span className="text-xs font-mono text-[#8d937e]">
                    User Inspection Mode (RBAC Authorized)
                  </span>
                </div>

                {/* User Identity Hero Card */}
                <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedUserDetail.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserDetail.user.name || selectedUserDetail.user.email)}&background=b7f15b&color=223600&bold=true`}
                      alt={selectedUserDetail.user.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#b7f15b]/40 shadow-xl shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserDetail.user.name || selectedUserDetail.user.email)}&background=b7f15b&color=223600&bold=true`;
                      }}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-[#dfe4de]">{selectedUserDetail.user.name}</h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                            selectedUserDetail.user.isDisabled
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-[#b7f15b]/20 text-[#b7f15b] border border-[#b7f15b]/30'
                          }`}
                        >
                          {selectedUserDetail.user.isDisabled ? 'DISABLED' : 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#c3c9b2]">{selectedUserDetail.user.email}</p>
                      <div className="flex items-center gap-2 pt-1 text-xs font-mono text-[#8d937e]">
                        <ShieldCheck className="w-4 h-4 text-[#b7f15b]" />
                        <span>Role: {selectedUserDetail.user.role}</span>
                        <span>•</span>
                        <span>Org: {selectedUserDetail.organizationName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1 font-mono text-xs text-[#8d937e]">
                    <div>User ID: {selectedUserDetail.user.id}</div>
                    <div>Joined: {new Date(selectedUserDetail.user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Developer Metric Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-2">
                    <div className="text-xs font-mono text-[#c3c9b2]/70 uppercase">Mined Commits</div>
                    <div className="text-3xl font-bold text-[#dfe4de] font-mono">{selectedUserDetail.metrics.totalCommits}</div>
                    <div className="text-[11px] font-mono text-[#8d937e]">Authored in Git Repos</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-2">
                    <div className="text-xs font-mono text-[#c3c9b2]/70 uppercase">Lines Added</div>
                    <div className="text-3xl font-bold text-[#b7f15b] font-mono">+{selectedUserDetail.metrics.totalLinesAdded}</div>
                    <div className="text-[11px] font-mono text-[#8d937e]">Code volume added</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-2">
                    <div className="text-xs font-mono text-[#c3c9b2]/70 uppercase">Lines Deleted</div>
                    <div className="text-3xl font-bold text-amber-400 font-mono">-{selectedUserDetail.metrics.totalLinesDeleted}</div>
                    <div className="text-[11px] font-mono text-[#8d937e]">Refactored / removed</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-2">
                    <div className="text-xs font-mono text-[#c3c9b2]/70 uppercase">Net Code Churn</div>
                    <div className="text-3xl font-bold text-[#92d957] font-mono">{selectedUserDetail.metrics.netChurn}</div>
                    <div className="text-[11px] font-mono text-[#8d937e]">Net line differential</div>
                  </div>
                </div>

                {/* Profile Details & Account Settings */}
                <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
                  <h3 className="text-base font-semibold text-[#dfe4de] border-b border-white/10 pb-3">
                    Account Profile & Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
                    <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-1">
                      <div className="text-[#8d937e] uppercase">Assigned Project</div>
                      <div className="text-[#b7f15b] font-bold truncate">{selectedUserDetail.projectName || 'Sentinel Engine Infrastructure'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-1">
                      <div className="text-[#8d937e] uppercase">Phone Number</div>
                      <div className="text-[#dfe4de] font-bold">{selectedUserDetail.user.phone || 'Not Specified'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-1">
                      <div className="text-[#8d937e] uppercase">Weekly Executive Reports</div>
                      <div className="text-[#b7f15b] font-bold">{selectedUserDetail.user.weeklyReports ? 'ENABLED' : 'DISABLED'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-1">
                      <div className="text-[#8d937e] uppercase">GitHub Sync Telemetry</div>
                      <div className="text-[#b7f15b] font-bold">{selectedUserDetail.user.githubSync ? 'ACTIVE' : 'DISABLED'}</div>
                    </div>
                  </div>
                </div>

                {/* Recent Developer Commits Table */}
                <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
                  <h3 className="text-base font-semibold text-[#dfe4de] border-b border-white/10 pb-3">
                    Recent Developer Commit Activity
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-[#8d937e] uppercase">
                          <th className="py-2.5 px-4">SHA-1 Hash</th>
                          <th className="py-2.5 px-4">Repository</th>
                          <th className="py-2.5 px-4">Commit Message</th>
                          <th className="py-2.5 px-4">Lines Delta</th>
                          <th className="py-2.5 px-4">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[#c3c9b2]">
                        {selectedUserDetail.recentCommits.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-[#8d937e]">
                              No commit activity records found for this developer.
                            </td>
                          </tr>
                        ) : (
                          selectedUserDetail.recentCommits.map((c) => (
                            <tr key={c.hash} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 px-4 font-bold text-[#b7f15b]">
                                <span className="px-2 py-1 rounded bg-[#b7f15b]/10 border border-[#b7f15b]/30">
                                  {c.hash.substring(0, 8)}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-[#dfe4de]">{c.repo_name || 'sentinel/core-engine'}</td>
                              <td className="py-3.5 px-4 text-[#dfe4de] max-w-md truncate">{c.message}</td>
                              <td className="py-3.5 px-4">
                                <span className="text-[#b7f15b] font-bold">+{c.lines_added || 0}</span> /{' '}
                                <span className="text-amber-400 font-bold">-{c.lines_deleted || 0}</span>
                              </td>
                              <td className="py-3.5 px-4 text-[#8d937e] whitespace-nowrap">
                                {new Date(c.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* User Directory Table */
              <>
                {/* Header Notification Card */}
                <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                      <Users className="w-6 h-6 text-[#b7f15b]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#dfe4de]">User Directory & Access Control</h2>
                      <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
                        Manage organization members, inspect user details, assign roles, or disable access.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <button
                        onClick={() => setShowAddUserModal(true)}
                        className="min-h-[44px] px-5 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#b7f15b]/20 flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add User</span>
                      </button>
                    )}
                  </div>
                </div>

                {userRoleMessage && (
                  <div className="p-4 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] flex items-center gap-3 text-sm font-mono animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{userRoleMessage}</span>
                  </div>
                )}

                <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-base font-semibold text-[#dfe4de]">Registered Organization Members</h3>
                    {(isLoadingUsers || isLoadingUserDetail) && (
                      <div className="flex items-center gap-2 text-xs font-mono text-[#b7f15b]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading Details...</span>
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 font-mono text-xs text-[#8d937e] uppercase">
                          <th className="py-3 px-4">User Identity</th>
                          <th className="py-3 px-4">Email Address</th>
                          <th className="py-3 px-4">Assigned Role (RBAC)</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {usersList.map((user) => {
                          const isSuperAdmin = user.email.toLowerCase() === 'vivekmohanraj5@gmail.com';
                          const isSelf = user.email.toLowerCase() === profileData.email.toLowerCase();
                          const isUpdating = updatingUserId === user.id;

                          return (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-4">
                                <div
                                  onClick={() => handleInspectUserDetail(user)}
                                  className="flex items-center gap-3 cursor-pointer group"
                                  title="Click to view detailed user profile & activity"
                                >
                                  <img
                                    src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=b7f15b&color=223600&bold=true`}
                                    alt={user.name || user.email}
                                    className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0 group-hover:border-[#b7f15b] transition-all"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=b7f15b&color=223600&bold=true`;
                                    }}
                                  />
                                  <div>
                                    <div className="font-medium text-[#dfe4de] group-hover:text-[#b7f15b] flex items-center gap-2 transition-colors">
                                      <span>{user.name || `${user.firstName} ${user.lastName}`.trim()}</span>
                                      {isSuperAdmin && (
                                        <span className="px-2 py-0.5 rounded-full bg-[#b7f15b]/20 border border-[#b7f15b]/40 text-[#b7f15b] text-[10px] font-mono font-bold uppercase">
                                          Owner Admin
                                        </span>
                                      )}
                                      {isSelf && (
                                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono text-[#8d937e]">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-[#8d937e] font-mono">
                                      ID: {user.id.slice(0, 8)}... (Click for Details)
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4 font-mono text-xs text-[#c3c9b2]">
                                {user.email}
                              </td>

                              <td className="py-4 px-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold inline-flex items-center gap-1.5 ${
                                    user.role === 'Admin'
                                      ? 'bg-[#b7f15b]/15 text-[#b7f15b] border border-[#b7f15b]/30'
                                      : user.role === 'Engineering Manager (Project owner)'
                                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                      : 'bg-[#181d1a] text-[#c3c9b2] border border-white/10'
                                  }`}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>{user.role}</span>
                                </span>
                              </td>

                              <td className="py-4 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                                    user.isDisabled
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-[#b7f15b]/20 text-[#b7f15b] border border-[#b7f15b]/30'
                                  }`}
                                >
                                  {user.isDisabled ? 'DISABLED' : 'ACTIVE'}
                                </span>
                              </td>

                              <td className="py-4 px-4 text-right">
                                {isSuperAdmin ? (
                                  <span className="text-xs font-mono text-[#8d937e] italic">Permanent Admin</span>
                                ) : (
                                  <div className="inline-flex items-center gap-2">
                                    {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-[#b7f15b]" />}
                                    {isAdmin && (
                                      <>
                                        <select
                                          value={user.role}
                                          disabled={isUpdating}
                                          onChange={(e) => handleRoleUpdate(user.id, user.email, e.target.value)}
                                          className="px-2.5 py-1.5 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] cursor-pointer"
                                        >
                                          <option value="Software Engineer (Developer)">Developer</option>
                                          <option value="Engineering Manager (Project owner)">Manager</option>
                                          <option value="Admin">Admin</option>
                                        </select>

                                        <button
                                          disabled={isUpdating}
                                          onClick={() => handleToggleUserDisable(user.id, user.isDisabled, user.email)}
                                          className={`p-1.5 rounded-xl border transition-colors ${
                                            user.isDisabled
                                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                          }`}
                                          title={user.isDisabled ? 'Enable User Account' : 'Disable User Account'}
                                        >
                                          {user.isDisabled ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                                        </button>

                                        <button
                                          disabled={isUpdating}
                                          onClick={() => handleDeleteUser(user.id, user.email)}
                                          className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                                          title="Delete User Account"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ADD USER MODAL */}
            {showAddUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-md p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                        <UserPlus className="w-5 h-5 text-[#b7f15b]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#dfe4de]">Add New User</h3>
                        <p className="text-xs font-mono text-[#c3c9b2]/70">Create a user account with signup credentials.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="text-[#8d937e] hover:text-[#dfe4de] transition-colors p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {addUserError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                      {addUserError}
                    </div>
                  )}

                  <form onSubmit={handleAdminAddUser} className="space-y-4">
                    <div>
                      <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Alex Engineer"
                        className="w-full h-11 px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-1.5">Work Email Address</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="alex@sentinel.engineering"
                        className="w-full h-11 px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-1.5">Password</label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-11 px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-1.5">Assigned Role</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] font-mono cursor-pointer"
                      >
                        <option value="Software Engineer (Developer)">Software Engineer (Developer)</option>
                        <option value="Engineering Manager (Project owner)">Engineering Manager (Project owner)</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="h-10 px-4 rounded-xl bg-white/5 text-[#c3c9b2] hover:bg-white/10 font-mono text-xs uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingUser}
                        className="h-10 px-6 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                      >
                        {isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        <span>{isCreatingUser ? 'Creating...' : 'Create Account'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3b. ACCESS RESTRICTED CARD FOR DEVELOPER ROLE ON USERS TAB */}
        {activeTab === 'Users' && isDeveloper && (
          <div className="p-8 rounded-2xl bg-[#1c211e] border border-[#ffb4ab]/30 space-y-4 text-center max-w-2xl mx-auto my-12 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-[#ffb4ab]" />
            </div>
            <h2 className="text-xl font-bold text-[#dfe4de]">Access Restricted to Admin & Managers</h2>
            <p className="text-xs font-mono text-[#c3c9b2] leading-relaxed">
              The User Directory contains organization access controls and team structures. Software Engineer roles are restricted from accessing member directory settings to enforce non-punitive privacy compliance.
            </p>
            <button
              onClick={() => setActiveTab('Dashboard')}
              className="px-6 py-2.5 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* 4. REPOSITORIES MANAGEMENT TAB */}
        {activeTab === 'Repositories' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Notification Card */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                  <FolderGit2 className="w-6 h-6 text-[#b7f15b]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#dfe4de]">Repository Knowledge Index</h2>
                  <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
                    Connected repositories mined into PostgreSQL and Knowledge Graph indices.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isAdmin || isManager ? (
                  <button
                    onClick={() => setShowAddRepoModal(true)}
                    className="min-h-[44px] px-5 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#b7f15b]/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Connect Repository</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#8d937e] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#8d937e]" />
                    <span>Connect Repository (Admin/Manager Only)</span>
                  </div>
                )}
              </div>
            </div>

            {repoMsg && (
              <div className="p-4 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] flex items-center gap-3 text-sm font-mono animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{repoMsg}</span>
              </div>
            )}

            {/* Repositories Grid */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-semibold text-[#dfe4de]">Active Ingested Repositories</h3>
                {isLoadingRepos && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#b7f15b]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading Repositories...</span>
                  </div>
                )}
              </div>

              {dbRepos.length === 0 && !isLoadingRepos ? (
                <div className="p-8 text-center space-y-3">
                  <FolderGit2 className="w-12 h-12 text-[#8d937e] mx-auto" />
                  <p className="text-sm font-mono text-[#c3c9b2]/70">No custom repositories connected yet.</p>
                  <button
                    onClick={() => setShowAddRepoModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#b7f15b] hover:border-[#b7f15b] transition-colors"
                  >
                    + Add Your First Repository
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dbRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="p-5 rounded-xl bg-[#181d1a] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-[#dfe4de] truncate flex items-center gap-2">
                            <FolderGit2 className="w-4 h-4 text-[#b7f15b]" />
                            {repo.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#92d957]/15 text-[#92d957] border border-[#92d957]/30 text-[10px] font-mono font-bold uppercase">
                            MINED
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#c3c9b2]/70 truncate flex items-center gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#8d937e]" />
                          {repo.git_url || repo.gitUrl}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-mono text-[#8d937e]">
                        <span>Last scan: {repo.last_mined_at ? new Date(repo.last_mined_at).toLocaleDateString() : 'Just now'}</span>
                        {(isAdmin || isManager) && (
                          <button
                            onClick={() => handleDeleteRepo(repo.id, repo.name)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-[#8d937e] transition-colors"
                            title="Unlink Repository"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ADD REPOSITORY MODAL */}
            {showAddRepoModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#b7f15b]/10 text-[#b7f15b]">
                        <FolderGit2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#dfe4de]">Connect Repository</h3>
                    </div>
                    <button
                      onClick={() => setShowAddRepoModal(false)}
                      className="p-1 rounded-lg text-[#8d937e] hover:text-[#dfe4de] hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddRepo} className="space-y-4">
                    <div>
                      <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-1.5">
                        Repository Name
                      </label>
                      <input
                        type="text"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        placeholder="e.g. sentinel/auth-service"
                        className="w-full h-11 px-4 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-1.5">
                        Git Remote URL / Path
                      </label>
                      <input
                        type="text"
                        value={newRepoUrl}
                        onChange={(e) => setNewRepoUrl(e.target.value)}
                        placeholder="https://github.com/org/repo.git or /local/path"
                        className="w-full h-11 px-4 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b]"
                        required
                      />
                    </div>

                    <div className="pt-3 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddRepoModal(false)}
                        className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono text-[#c3c9b2] hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingRepo}
                        className="px-5 py-2.5 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs font-bold uppercase hover:opacity-90 flex items-center gap-2"
                      >
                        {isAddingRepo && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isAddingRepo ? 'Saving...' : 'Add Repository'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. RISK RADAR TELEMETRY MATRIX TAB */}
        {activeTab === 'Risk Radar' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Telemetry Card */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                  <Radar className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#dfe4de]">Risk Radar Telemetry Matrix</h2>
                  <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
                    Real-time defect density scanning across active codebase branches and pull requests.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-[#181d1a] border border-white/10 text-xs font-mono text-[#92d957]">
                  Scan Velocity: 1,420 lines/sec
                </span>
              </div>
            </div>

            {/* Filterable PR Telemetry List */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <h3 className="text-base font-semibold text-[#dfe4de]">Active Pull Request Telemetry</h3>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#8d937e]" />
                  <span className="text-xs font-mono text-[#8d937e] uppercase">Filter:</span>
                  {['ALL', 'CRITICAL', 'WARNING'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setRiskFilter(filter)}
                      className={`px-3 py-1 rounded-xl font-mono text-xs transition-colors ${
                        riskFilter === filter
                          ? 'bg-[#b7f15b] text-[#223600] font-bold'
                          : 'bg-[#181d1a] text-[#c3c9b2] hover:text-[#dfe4de]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {isLoadingRiskRadar ? (
                  <div className="p-8 text-center text-xs font-mono text-[#b7f15b] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ingesting PR Defect Telemetry from PostgreSQL...</span>
                  </div>
                ) : riskPredictions.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-[#8d937e]">
                    No pull request defect risk assessments recorded yet.
                  </div>
                ) : (
                  riskPredictions
                    .filter((item) => {
                      if (riskFilter === 'CRITICAL') return item.score >= 75;
                      if (riskFilter === 'WARNING') return item.score >= 60 && item.score < 75;
                      return true;
                    })
                    .map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-5 rounded-xl bg-[#181d1a] border border-white/5 hover:border-white/20 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-[#b7f15b] font-bold">{item.pr}</span>
                            <span className="font-semibold text-sm text-[#dfe4de]">{item.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#8d937e]">{item.author}</span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                                item.score >= 75
                                  ? 'bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              Risk: {item.score}%
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#c3c9b2]/70 leading-relaxed font-mono">
                          Diagnostic Summary: &quot;{item.reason}&quot;
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono text-[#8d937e] uppercase">Affected Paths:</span>
                            {(item.modules || []).map((mod, mIdx) => (
                              <span
                                key={mIdx}
                                className="px-2.5 py-0.5 rounded-lg bg-[#262b28] border border-white/5 text-[11px] font-mono text-[#dfe4de]"
                              >
                                {mod}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => setShapModalData({ isOpen: true, filePath: (item.modules && item.modules[0]) || 'src/sentinel/core-engine/mainEngine.js', riskScore: item.score || 84 })}
                            className="px-3 py-1 rounded-lg bg-[#b7f15b]/10 hover:bg-[#b7f15b]/20 border border-[#b7f15b]/30 text-[#b7f15b] text-[11px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Cpu className="w-3.5 h-3.5 text-[#b7f15b]" />
                            <span>Explain Risk Factors</span>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. TECH DEBT ARCHITECTURAL HOTSPOTS TAB */}
        {activeTab === 'Tech Debt' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Telemetry Card */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                  <TrendingUp className="w-6 h-6 text-[#b7f15b]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#dfe4de]">Architectural Tech Debt Hotspots</h2>
                  <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
                    Systemic behavioral code degradation insights and automated refactoring recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-[#181d1a] border border-white/10 text-xs font-mono text-[#b7f15b]">
                  Health Index: 78/100
                </span>
              </div>
            </div>

            {/* Refactoring Priority Quadrant Matrix */}
            <TechDebtQuadrantMatrix
              onSelectRefactor={(filePath, complexity) => setRefactorModalData({ isOpen: true, filePath, complexityScore: complexity })}
            />

            {/* Architectural Dependency Node Diagram & Radial Gauge Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Architectural Module Coupling & Dependency Node Diagram */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#dfe4de]">Architectural Dependency & Coupling Graph</h3>
                    <p className="text-xs font-mono text-[#c3c9b2]/70">Inter-module coupling index map and tangled import vectors.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    7.4 / 10 Coupling Index
                  </span>
                </div>

                <div className="relative w-full h-64 bg-[#181d1a] rounded-xl border border-white/5 p-4 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid meet">
                    {/* Connection Edges */}
                    <path d="M 100 110 Q 250 50 400 110" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 2" />
                    <path d="M 100 110 Q 250 170 400 110" fill="none" stroke="#f59e0b" strokeWidth="2" />
                    <path d="M 400 110 Q 480 60 520 110" fill="none" stroke="#b7f15b" strokeWidth="1.5" />
                    <path d="M 100 110 Q 300 110 520 110" fill="none" stroke="#8d937e" strokeWidth="1" strokeDasharray="2 2" />

                    {/* Coupling Weight Badges */}
                    <rect x="230" y="65" width="45" height="18" rx="4" fill="#1c211e" stroke="#ef4444" strokeWidth="1" />
                    <text x="252" y="78" fill="#ffb4ab" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">7.4 CPL</text>

                    <rect x="230" y="140" width="45" height="18" rx="4" fill="#1c211e" stroke="#f59e0b" strokeWidth="1" />
                    <text x="252" y="153" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">5.8 CPL</text>

                    {/* Node 1: Auth Session */}
                    <g transform="translate(100, 110)">
                      <circle r="26" fill="#1c211e" stroke="#ef4444" strokeWidth="3" />
                      <circle r="32" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.3" />
                      <text y="-35" fill="#dfe4de" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Auth Session</text>
                      <text y="4" fill="#ffb4ab" fontSize="9" fontFamily="monospace" textAnchor="middle">84% Risk</text>
                    </g>

                    {/* Node 2: Payment Gateway */}
                    <g transform="translate(400, 110)">
                      <circle r="24" fill="#1c211e" stroke="#f59e0b" strokeWidth="3" />
                      <text y="-33" fill="#dfe4de" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Payment Gateway</text>
                      <text y="4" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">72% Risk</text>
                    </g>

                    {/* Node 3: Cache Eviction */}
                    <g transform="translate(250, 40)">
                      <circle r="18" fill="#1c211e" stroke="#a855f7" strokeWidth="2.5" />
                      <text y="-25" fill="#dfe4de" fontSize="9" fontFamily="monospace" textAnchor="middle">Cache Eviction</text>
                    </g>

                    {/* Node 4: Planner Engine */}
                    <g transform="translate(250, 180)">
                      <circle r="18" fill="#1c211e" stroke="#b7f15b" strokeWidth="2.5" />
                      <text y="30" fill="#dfe4de" fontSize="9" fontFamily="monospace" textAnchor="middle">Planner Engine</text>
                    </g>

                    {/* Node 5: DB Migrations */}
                    <g transform="translate(520, 110)">
                      <circle r="20" fill="#1c211e" stroke="#92d957" strokeWidth="2.5" />
                      <text y="-28" fill="#dfe4de" fontSize="9" fontFamily="monospace" textAnchor="middle">DB Migrations</text>
                      <text y="4" fill="#92d957" fontSize="9" fontFamily="monospace" textAnchor="middle">48% Risk</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Technical Debt Degradation Radial Gauge Arc */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col justify-between items-center space-y-4 text-center">
                <span className="text-xs font-mono text-[#c3c9b2]/70 uppercase tracking-wider">Technical Debt Arc Gauge</span>
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#262b28" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="65" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <span className="text-3xl font-bold text-amber-400">7.4</span>
                    <span className="text-[10px] text-[#8d937e]">DEBT INDEX</span>
                  </div>
                </div>
                <p className="text-xs text-[#c3c9b2]/70 font-mono">
                  Decoupling Auth & Cache interface will reduce predicted release risk by <span className="text-[#b7f15b] font-bold">32%</span>.
                </p>
              </div>
            </div>

            {rescanMessage && (
              <div className="p-4 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] flex items-center gap-3 text-sm font-mono animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{rescanMessage}</span>
              </div>
            )}

            {/* Ingested Module Hotspots Table */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-semibold text-[#dfe4de]">Inferred Architectural Hotspots</h3>
                  <p className="text-xs font-mono text-[#c3c9b2]/70">Modules exceeding AST cyclomatic complexity thresholds requiring refactoring.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  {['ALL', 'FACADE', 'REPOSITORY', 'MIDDLEWARE'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPatternFilter(p)}
                      className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                        patternFilter === p
                          ? 'bg-[#b7f15b]/20 border-[#b7f15b] text-[#b7f15b] font-bold'
                          : 'bg-[#181d1a] border-white/10 text-[#8d937e] hover:text-[#dfe4de]'
                      }`}
                    >
                      {p === 'ALL' ? 'All Patterns' : p === 'FACADE' ? 'Service Facade' : p === 'REPOSITORY' ? 'Repository Pattern' : 'Middleware Decoupling'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[#8d937e] uppercase">
                      <th className="py-2.5 px-4">File Path</th>
                      <th className="py-2.5 px-4">Complexity Score</th>
                      <th className="py-2.5 px-4">Churn Rate</th>
                      <th className="py-2.5 px-4">Bug Frequency</th>
                      <th className="py-2.5 px-4">Severity Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#c3c9b2]">
                    {hotspotsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#8d937e]">
                          No complexity hotspots indexed for this repository. Click &quot;Rescan Codebase&quot; to run analysis.
                        </td>
                      </tr>
                    ) : (
                      hotspotsList
                        .filter((h) => {
                          const path = (h.file_path || h.filePath || '').toLowerCase();
                          if (patternFilter === 'FACADE') return path.includes('engine') || path.includes('main');
                          if (patternFilter === 'REPOSITORY') return path.includes('pool') || path.includes('db');
                          if (patternFilter === 'MIDDLEWARE') return path.includes('router') || path.includes('api');
                          return true;
                        })
                        .map((h) => {
                        const complexity = parseFloat(h.complexity_score || h.complexityScore || 0);
                        const isCritical = complexity >= 15;
                        const isElevated = complexity >= 10 && complexity < 15;

                        return (
                          <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-4 font-bold text-[#dfe4de]">{h.file_path || h.filePath}</td>
                            <td className="py-3.5 px-4 font-bold text-[#b7f15b]">{complexity.toFixed(1)}</td>
                            <td className="py-3.5 px-4 text-[#c3c9b2]">{h.churn_rate || h.churnRate} edits</td>
                            <td className="py-3.5 px-4 text-[#c3c9b2]">{h.bug_frequency || h.bugFrequency} bugs</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                                  isCritical
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : isElevated
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-[#b7f15b]/20 text-[#b7f15b] border border-[#b7f15b]/30'
                                }`}
                              >
                                {isCritical ? 'CRITICAL' : isElevated ? 'ELEVATED' : 'NORMAL'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hotspots Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#c3c9b2]/70">Coupling Index</span>
                  <span className="text-[#ffb4ab] font-bold">7.4 / 10 (HIGH)</span>
                </div>
                <h4 className="font-semibold text-base text-[#dfe4de]">Auth & Caching Tight Coupling</h4>
                <p className="text-xs text-[#c3c9b2]/70 leading-relaxed">
                  Tangled imports between session verification and cache eviction logic are driving 62% of refactoring friction.
                </p>
                <div className="pt-2 border-t border-white/5 text-xs font-mono text-[#b7f15b]">
                  Action: Decouple JWT Token Handler
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#c3c9b2]/70">Complexity Churn</span>
                  <span className="text-amber-300 font-bold">+18% This Sprint</span>
                </div>
                <h4 className="font-semibold text-base text-[#dfe4de]">Payment Gateway Branching</h4>
                <p className="text-xs text-[#c3c9b2]/70 leading-relaxed">
                  Async webhook reconciliation handler has accumulated 14 conditional branches without isolated unit tests.
                </p>
                <div className="pt-2 border-t border-white/5 text-xs font-mono text-amber-300">
                  Action: Extract State Machine Interface
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#c3c9b2]/70">Refactoring Priority</span>
                  <span className="text-[#b7f15b] font-bold">Recommended</span>
                </div>
                <h4 className="font-semibold text-base text-[#dfe4de]">Extract Middleware Interface</h4>
                <p className="text-xs text-[#c3c9b2]/70 leading-relaxed">
                  Decoupling JWT token lifecycle will reduce predicted release risk for Sprint 43 by an estimated 32%.
                </p>
                <div className="pt-2 border-t border-white/5 text-xs font-mono text-[#b7f15b]">
                  Action: Priority Refactor Sprint 43
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. ADMIN SYSTEM TELEMETRY & EXECUTION LOGS TAB */}
        {activeTab === 'Telemetry' && isAdmin && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Telemetry Notification Card */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                  <Terminal className="w-6 h-6 text-[#b7f15b]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#dfe4de]">System Telemetry & Audit Logs</h2>
                  <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
                    Real-time backend execution status, process memory allocation, and database pool telemetry.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-[#b7f15b]/10 border border-[#b7f15b]/30 text-[#b7f15b] font-mono text-xs font-bold uppercase">
                  Uptime: {telemetryData?.serverUptime || 'Loading...'}
                </span>
              </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]/70">
                  <span>Process Memory RSS</span>
                  <HardDrive className="w-4 h-4 text-[#b7f15b]" />
                </div>
                <div className="text-3xl font-bold text-[#dfe4de] font-mono">
                  {telemetryData?.memoryRssMB || '0.00'} MB
                </div>
                <div className="text-xs font-mono text-[#8d937e]">
                  Heap Used: {telemetryData?.heapUsedMB || '0'} / {telemetryData?.heapTotalMB || '0'} MB
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]/70">
                  <span>PostgreSQL Pool</span>
                  <Server className="w-4 h-4 text-[#92d957]" />
                </div>
                <div className="text-3xl font-bold text-[#dfe4de] font-mono">
                  {telemetryData?.dbPoolStats?.totalClients || 1} Connections
                </div>
                <div className="text-xs font-mono text-[#8d937e]">
                  Idle: {telemetryData?.dbPoolStats?.idleClients || 1} | Waiting: {telemetryData?.dbPoolStats?.waitingClients || 0}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#c3c9b2]/70">
                  <span>Static AST Engines</span>
                  <Cpu className="w-4 h-4 text-[#b7f15b]" />
                </div>
                <div className="text-3xl font-bold text-[#dfe4de] font-mono">
                  4 Active
                </div>
                <div className="text-xs font-mono text-[#92d957]">
                  0 External Requests (100% Offline)
                </div>
              </div>
            </div>

            {/* Model Health Badges */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
              <h3 className="text-base font-semibold text-[#dfe4de] border-b border-white/10 pb-3">
                Deterministic Static Code Quality Pipeline Health
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-1.5 font-mono text-xs">
                  <div className="text-[#dfe4de] font-bold">AST Cyclomatic Analyzer</div>
                  <div className="text-[#92d957]">{telemetryData?.modelsStatus?.astAnalyzer || 'OPERATIONAL (Rule-based AST)'}</div>
                </div>

                <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-1.5 font-mono text-xs">
                  <div className="text-[#dfe4de] font-bold">Co-Change Coupling Evaluator</div>
                  <div className="text-[#b7f15b]">{telemetryData?.modelsStatus?.cyclomaticCalculator || 'ACTIVE (Coupling Vectors)'}</div>
                </div>

                <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-1.5 font-mono text-xs">
                  <div className="text-[#dfe4de] font-bold">Static Rule Refactoring Engine</div>
                  <div className="text-[#92d957]">{telemetryData?.modelsStatus?.coChangeMatrix || 'COMPUTED'}</div>
                </div>

                <div className="p-4 rounded-xl bg-[#181d1a] border border-white/5 space-y-1.5 font-mono text-xs">
                  <div className="text-[#dfe4de] font-bold">NetworkX Knowledge Graph</div>
                  <div className="text-[#b7f15b]">{telemetryData?.modelsStatus?.networkxGraph || 'INDEXED'}</div>
                </div>
              </div>
            </div>

            {/* Execution Audit Log Stream Table */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-semibold text-[#dfe4de]">Background Event & Execution Stream</h3>
                {isLoadingTelemetry && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#b7f15b]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Streaming Logs...</span>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[#8d937e] uppercase">
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Level</th>
                      <th className="py-2.5 px-4">Log Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#c3c9b2]">
                    {(telemetryData?.recentLogs || []).map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-[#8d937e] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              log.level === 'WARN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-[#b7f15b]/20 text-[#b7f15b] border border-[#b7f15b]/30'
                            }`}
                          >
                            {log.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#dfe4de]">
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7b. ACCESS RESTRICTED CARD FOR NON-ADMIN ON TELEMETRY TAB */}
        {activeTab === 'Telemetry' && !isAdmin && (
          <div className="p-8 rounded-2xl bg-[#1c211e] border border-[#ffb4ab]/30 space-y-4 text-center max-w-2xl mx-auto my-12 shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/30 flex items-center justify-center mx-auto">
              <Terminal className="w-8 h-8 text-[#ffb4ab]" />
            </div>
            <h2 className="text-xl font-bold text-[#dfe4de]">Access Restricted to System Administrator</h2>
            <p className="text-xs font-mono text-[#c3c9b2] leading-relaxed">
              System execution logs, memory heap profiling, and raw database pool telemetry are restricted strictly to System Administrators.
            </p>
            <button
              onClick={() => setActiveTab('Dashboard')}
              className="px-6 py-2.5 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* CREATE PROJECT MODAL */}
        {showAddProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                    <FolderKanban className="w-5 h-5 text-[#b7f15b]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#dfe4de]">Create New Project</h3>
                    <p className="text-xs font-mono text-[#c3c9b2]/70">Add a project structure under your Organization.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddProjectModal(false)}
                  className="text-[#8d937e] hover:text-[#dfe4de] transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newProjectName) return;
                  setIsCreatingProject(true);
                  try {
                    const created = await createProjectApi(null, newProjectName, newProjectDesc);
                    if (created) {
                      setProjectsList([created, ...projectsList]);
                      setSelectedProject(created.id);
                      setNewProjectName('');
                      setNewProjectDesc('');
                      setShowAddProjectModal(false);
                    }
                  } catch (err) {
                    console.error('Failed to create project:', err);
                  } finally {
                    setIsCreatingProject(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">Project Name</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Core Engine v2"
                    className="w-full h-11 px-4 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#c3c9b2] uppercase mb-2">Description</label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Brief architectural scope or sprint target..."
                    className="w-full h-24 p-3 rounded-xl bg-[#181d1a] border border-white/10 text-sm text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddProjectModal(false)}
                    className="h-10 px-4 rounded-xl bg-white/5 text-[#c3c9b2] hover:bg-white/10 transition-all font-mono text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingProject}
                    className="h-10 px-6 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isCreatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{isCreatingProject ? 'Creating...' : 'Create Project'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SYSTEM NOTIFICATION & ALERT CENTER DRAWER */}
        {showNotificationDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-[#1c211e] border-l border-white/10 shadow-2xl flex flex-col justify-between">
                {/* Drawer Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                      <Bell className="w-5 h-5 text-[#b7f15b]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#dfe4de]">System Alerts & Notifications</h3>
                      <p className="text-xs font-mono text-[#c3c9b2]/70">
                        {unreadCount} unread system alert{unreadCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAlertPolicyModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-[#b7f15b]/10 hover:bg-[#b7f15b]/20 border border-[#b7f15b]/30 text-[#b7f15b] text-[10px] font-mono font-bold uppercase transition-all"
                      title="Configure Alert Threshold Rules"
                    >
                      Configure Policies
                    </button>
                    <button
                      onClick={() => setShowNotificationDrawer(false)}
                      className="text-[#8d937e] hover:text-[#dfe4de] transition-colors p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {notificationsList.length === 0 ? (
                    <div className="text-center py-12 text-xs font-mono text-[#8d937e]">
                      No notifications available.
                    </div>
                  ) : (
                    notificationsList.map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          if (!n.is_read) {
                            await markNotificationReadApi(n.id);
                            setNotificationsList(
                              notificationsList.map((item) =>
                                item.id === n.id ? { ...item, is_read: true } : item
                              )
                            );
                          }
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          n.is_read
                            ? 'bg-[#181d1a]/50 border-white/5 opacity-70'
                            : 'bg-[#181d1a] border-[#b7f15b]/30 shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {n.type === 'SECURITY' && <ShieldAlert className="w-4 h-4 text-emerald-400" />}
                            {n.type === 'WARN' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            {n.type === 'INFO' && <Info className="w-4 h-4 text-[#b7f15b]" />}
                            <span className="font-bold text-xs text-[#dfe4de] font-mono">{n.title}</span>
                          </div>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-[#b7f15b] shrink-0" title="Unread" />
                          )}
                        </div>

                        <p className="text-xs text-[#c3c9b2]/70 leading-relaxed font-mono">{n.message}</p>

                        <div className="text-[10px] font-mono text-[#8d937e] pt-1 flex items-center justify-between border-t border-white/5">
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                          <span className="uppercase text-[#92d957]">{n.type}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-6 border-t border-white/10 flex items-center justify-between bg-[#181d1a]">
                  <button
                    onClick={async () => {
                      await markAllNotificationsReadApi(profileData.email);
                      setNotificationsList(notificationsList.map((item) => ({ ...item, is_read: true })));
                    }}
                    className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#dfe4de] transition-all font-mono text-xs uppercase flex items-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4 text-[#b7f15b]" />
                    <span>Mark All Read</span>
                  </button>

                  <button
                    onClick={() => setShowNotificationDrawer(false)}
                    className="h-10 px-6 rounded-xl bg-[#b7f15b] text-[#223600] font-mono text-xs uppercase font-bold hover:opacity-90 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. COMMITS LOG & DEVELOPER ACTIVITY TAB */}
        {activeTab === 'Commits' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Banner & Search */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#b7f15b]/10 border border-[#b7f15b]/30 flex items-center justify-center text-[#b7f15b]">
                  <GitCommit className="w-6 h-6 text-[#b7f15b]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#dfe4de]">Commit Log & Code Churn Analytics</h2>
                  <p className="text-xs font-mono text-[#c3c9b2]/70 mt-0.5">
                    Mined Git commit history, developer contribution records, and line delta telemetry.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  value={commitSearch}
                  onChange={(e) => setCommitSearch(e.target.value)}
                  placeholder="Search hash, message, or author..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#181d1a] border border-white/10 text-xs font-mono text-[#dfe4de] focus:outline-none focus:border-[#b7f15b] transition-colors"
                />
                <Filter className="w-4 h-4 text-[#8d937e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Commits Summary Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-2">
                <div className="text-xs font-mono text-[#c3c9b2]/70 uppercase">Mined Commits</div>
                <div className="text-3xl font-bold text-[#dfe4de] font-mono">{commitsList.length}</div>
                <div className="text-[11px] font-mono text-[#8d937e]">Indexed in PostgreSQL</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-2">
                <div className="text-xs font-mono text-[#c3c9b2]/70 uppercase">Lines Added</div>
                <div className="text-3xl font-bold text-[#b7f15b] font-mono">
                  +{commitsList.reduce((acc, c) => acc + (c.lines_added || 0), 0)}
                </div>
                <div className="text-[11px] font-mono text-[#8d937e]">Total growth delta</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-2">
                <div className="text-xs font-mono text-[#c3c9b2]/70 uppercase">Lines Deleted</div>
                <div className="text-3xl font-bold text-amber-400 font-mono">
                  -{commitsList.reduce((acc, c) => acc + (c.lines_deleted || 0), 0)}
                </div>
                <div className="text-[11px] font-mono text-[#8d937e]">Refactored / removed</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-2">
                <div className="text-xs font-mono text-[#c3c9b2]/70 uppercase">Net Code Churn</div>
                <div className="text-3xl font-bold text-[#92d957] font-mono">
                  {commitsList.reduce((acc, c) => acc + ((c.lines_added || 0) - (c.lines_deleted || 0)), 0)}
                </div>
                <div className="text-[11px] font-mono text-[#8d937e]">Net line differential</div>
              </div>
            </div>

            {/* Commit Log Table */}
            <div className="p-6 rounded-2xl bg-[#1c211e] border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-semibold text-[#dfe4de]">Mined Commit Log Records</h3>
                {isLoadingCommits && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#b7f15b]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading Commits...</span>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[#8d937e] uppercase">
                      <th className="py-2.5 px-4">SHA-1 Hash</th>
                      <th className="py-2.5 px-4">Author</th>
                      <th className="py-2.5 px-4">Commit Message</th>
                      <th className="py-2.5 px-4">Lines Delta</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#c3c9b2]">
                    {commitsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[#8d937e]">
                          No commits found matching query.
                        </td>
                      </tr>
                    ) : (
                      commitsList.map((c) => (
                        <tr key={c.hash} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#b7f15b]">
                            <span className="px-2 py-1 rounded bg-[#b7f15b]/10 border border-[#b7f15b]/30">
                              {c.hash.substring(0, 8)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#dfe4de]">{c.author_email}</td>
                          <td className="py-3.5 px-4 text-[#dfe4de] max-w-md truncate">{c.message}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-[#b7f15b] font-bold">+{c.lines_added || 0}</span> /{' '}
                            <span className="text-amber-400 font-bold">-{c.lines_deleted || 0}</span>
                          </td>
                          <td className="py-3.5 px-4 text-[#8d937e] whitespace-nowrap">
                            {new Date(c.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. KNOWLEDGE GRAPH TOPOLOGY TAB */}
        {activeTab === 'Knowledge Graph' && (
          <KnowledgeGraphView selectedRepo={selectedRepo} />
        )}

        {/* PHASE 2 EXTENSION MODALS */}
        <PrScanModal
          isOpen={showPrScanModal}
          onClose={() => setShowPrScanModal(false)}
          selectedRepo={selectedRepo}
        />

        <RefactorModal
          isOpen={refactorModalData.isOpen}
          onClose={() => setRefactorModalData({ ...refactorModalData, isOpen: false })}
          filePath={refactorModalData.filePath}
          complexityScore={refactorModalData.complexityScore}
        />

        {/* PHASE 3 EXTENSION MODALS & DRAWERS */}
        <ShapExplainerModal
          isOpen={shapModalData.isOpen}
          onClose={() => setShapModalData({ ...shapModalData, isOpen: false })}
          filePath={shapModalData.filePath}
          riskScore={shapModalData.riskScore}
        />

        <BusFactorDrawer
          isOpen={showBusFactorDrawer}
          onClose={() => setShowBusFactorDrawer(false)}
          selectedRepo={selectedRepo}
        />

        {/* PHASE 4 EXTENSION MODALS */}
        <BranchDiagnosticsModal
          isOpen={showBranchDiagModal}
          onClose={() => setShowBranchDiagModal(false)}
          selectedRepo={selectedRepo}
        />

        <AlertPolicyModal
          isOpen={showAlertPolicyModal}
          onClose={() => setShowAlertPolicyModal(false)}
        />
      </main>
    </div>
  );
};

export default Dashboard;
