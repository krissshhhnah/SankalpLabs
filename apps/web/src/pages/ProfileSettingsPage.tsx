import React, { useState, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { ProfileDropdown } from '../components/ProfileDropdown';
import {
  ExternalLink,
  Users,
  BarChart3,
  Shield,
  Grid,
  HelpCircle,
  Upload,
  Trash2,
  Check,
  Save,
} from 'lucide-react';

interface ProfileSettingsPageProps {
  onBackToBoards: () => void;
  onOpenAdminConsole: () => void;
  onOpenTrash: () => void;
  onOpenLearningCenter: () => void;
  onOpenAppsModal: () => void;
  onOpenDeveloperHub: () => void;
  onOpenMarketplace: () => void;
  onOpenUpgrade: () => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  onBackToBoards,
  onOpenAdminConsole,
  onOpenTrash,
  onOpenLearningCenter,
  onOpenAppsModal,
  onOpenDeveloperHub,
  onOpenMarketplace,
  onOpenUpgrade,
}) => {
  const { user, updateUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'apps' | 'integrations'>('profile');
  const [sidebarTab, setSidebarTab] = useState<'profile' | 'users' | 'analytics' | 'security' | 'apps' | 'team'>('profile');

  // Profile Form States
  const [name, setName] = useState(user?.name || 'Krishnendu Prasanth');
  const [organization, setOrganization] = useState(user?.organization || 'Antigravity AI');
  const [industry, setIndustry] = useState(user?.industry || 'Software & Technology');
  const [role, setRole] = useState(user?.role || 'Teacher / Student');
  const [language, setLanguage] = useState(user?.language || 'English');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Krishnendu'
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const newUrl = reader.result.toString();
          setAvatarUrl(newUrl);
          updateUser({ avatarUrl: newUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    const defaultUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default';
    setAvatarUrl(defaultUrl);
    updateUser({ avatarUrl: defaultUrl });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      organization,
      industry,
      role,
      language,
      avatarUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col select-none">
      {/* 1. Top Header Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 shadow-2xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onBackToBoards}>
            <img src="/sankalplabs-by-kk.png" alt="SankalpLabs" className="h-8 sm:h-9 w-auto object-contain hover:opacity-90 transition duration-150" />
          </div>

          <button
            onClick={onBackToBoards}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <span>Go to boards</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={onOpenUpgrade}
            className="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Upgrade
          </button>

          <button
            onClick={onOpenLearningCenter}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
            title="Help & Support"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative">
            <img
              src={avatarUrl}
              alt={name}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition object-cover"
            />

            <ProfileDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              onOpenProfileSettings={() => {}}
              onOpenAdminConsole={onOpenAdminConsole}
              onOpenTrash={onOpenTrash}
              onOpenLearningCenter={onOpenLearningCenter}
              onOpenAppsModal={onOpenAppsModal}
              onOpenDeveloperHub={onOpenDeveloperHub}
              onOpenMarketplace={onOpenMarketplace}
              onOpenUpgrade={onOpenUpgrade}
            />
          </div>
        </div>
      </header>

      {/* 2. Main Page Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-8 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="w-56 space-y-6">
          {/* Workspace Team Badge */}
          <div className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">AI</span>
              <span className="text-[10px] text-slate-400 font-medium">Team Admin</span>
            </div>
          </div>

          {/* Sidebar Nav Items */}
          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => {
                setSidebarTab('users');
                onOpenAdminConsole();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Users</span>
            </button>

            <button
              onClick={() => setSidebarTab('analytics')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span>Analytics</span>
              </div>
              <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <button
              onClick={() => setSidebarTab('security')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Security</span>
            </button>

            <button
              onClick={() => {
                setSidebarTab('apps');
                onOpenMarketplace();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <Grid className="w-4 h-4 text-slate-400" />
              <span>Apps</span>
            </button>

            <button
              onClick={() => setSidebarTab('team')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-2xs transition"
            >
              <Grid className="w-4 h-4 text-slate-400" />
              <span>Team profile</span>
            </button>
          </nav>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile settings</h1>

          {/* Horizontal Tabs */}
          <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Profile
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Notifications
            </button>

            <button
              onClick={() => setActiveTab('apps')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'apps'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Your apps
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`pb-3 border-b-2 transition ${
                activeTab === 'integrations'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Integrations
            </button>
          </div>

          {/* Tab Content: Profile Settings Form */}
          {activeTab === 'profile' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs">
              <form onSubmit={handleSaveProfile} className="flex flex-col lg:flex-row gap-12 justify-between">
                {/* Form Fields */}
                <div className="flex-1 space-y-5 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Organization</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Your organization name"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 transition shadow-2xs"
                    >
                      <option value="Software & Technology">Software & Technology</option>
                      <option value="Education">Education</option>
                      <option value="Design & Creative">Design & Creative</option>
                      <option value="Finance & Banking">Finance & Banking</option>
                      <option value="Healthcare">Healthcare</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 transition shadow-2xs"
                    >
                      <option value="Teacher / Student">Teacher / Student</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 transition shadow-2xs"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
                    >
                      {savedSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Saved Changes</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Side: Circular Avatar Upload Section */}
                <div className="flex flex-col items-center gap-4 pt-4 lg:pt-0">
                  <div className="relative group w-44 h-44 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-100">
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition shadow-2xs"
                    >
                      Upload
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-semibold text-xs rounded-xl transition shadow-2xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4 text-xs text-slate-700">
              <h3 className="font-bold text-sm text-slate-900">Email Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  <span>Receive weekly updates and whiteboard summaries</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                  <span>Notify me when someone comments on my board</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'apps' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs text-xs text-slate-700 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Authorized Applications</h3>
              <p className="text-slate-500">You have no third-party OAuth apps connected.</p>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs text-xs text-slate-700 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Available Integrations</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Slack</span>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px]">Connect</button>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Google Drive</span>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px]">Connect</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
