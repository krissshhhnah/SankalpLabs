import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  X,
  User,
  Mail,
  Check,
  Camera,
  LogOut,
  Sliders,
  Zap,
  Save,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, showToast }) => {
  const { user, updateUser, logout } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'
  );
  const [gridPreference, setGridPreference] = useState('dots');
  const [autoSaveSound, setAutoSaveSound] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim() || 'User',
      email: email.trim() || 'user@example.com',
      avatarUrl,
    });
    setSavedSuccess(true);
    if (showToast) showToast('Profile settings saved successfully!');
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="w-16 h-16 rounded-2xl border-2 border-white/80 shadow-md object-cover bg-white/20"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{name || 'User'}</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
                  Pro Plan
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">{email || 'user@example.com'}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Profile Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Personal Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Avatar Selector Gallery */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Avatar Preset Gallery</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setAvatarUrl(url)}
                    className={`relative p-0.5 rounded-2xl border-2 transition ${
                      avatarUrl === url ? 'border-blue-600 shadow-md scale-105' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-10 h-10 rounded-xl bg-slate-100" />
                    {avatarUrl === url && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Canvas & App Preferences
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Default Grid Style</span>
                <span className="text-[10px] text-slate-400">Preferred background pattern for new whiteboards</span>
              </div>
              <select
                value={gridPreference}
                onChange={(e) => setGridPreference(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="dots">Dots Pattern</option>
                <option value="lines">Line Grid</option>
                <option value="grid">Square Grid</option>
                <option value="none">Blank Canvas</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">Audio Feedback & Notifications</span>
                <span className="text-[10px] text-slate-400">Play subtle sound on auto-save & comments</span>
              </div>
              <input
                type="checkbox"
                checked={autoSaveSound}
                onChange={(e) => setAutoSaveSound(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
              />
            </div>
          </div>

          {/* Account Tier Info Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">AI Plan Workspace</span>
                <span className="text-[10px] text-slate-500">Unlimited whiteboards & real-time collaboration</span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              Active
            </span>
          </div>

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
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
        </form>
      </div>
    </div>
  );
};
