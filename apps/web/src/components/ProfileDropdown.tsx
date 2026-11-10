import React, { useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  User,
  Shield,
  Trash2,
  HelpCircle,
  Smartphone,
  Code,
  Zap,
  Sparkles,
  LogOut,
  ChevronRight,
  ArrowUpRight,
  Compass,
} from 'lucide-react';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfileSettings: () => void;
  onOpenAdminConsole: () => void;
  onOpenTrash: () => void;
  onOpenLearningCenter: () => void;
  onOpenAppsModal: () => void;
  onOpenDeveloperHub: () => void;
  onOpenMarketplace: () => void;
  onOpenUpgrade: () => void;
  onOpenLanding?: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  onOpenProfileSettings,
  onOpenAdminConsole,
  onOpenTrash,
  onOpenLearningCenter,
  onOpenAppsModal,
  onOpenDeveloperHub,
  onOpenMarketplace,
  onOpenUpgrade,
  onOpenLanding,
}) => {
  const { user, logout } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-72 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150 select-none font-sans"
    >
      {/* 1. Header Profile Banner */}
      <div
        onClick={() => {
          onOpenProfileSettings();
          onClose();
        }}
        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/80 cursor-pointer transition group border-b border-slate-100 pb-3 mb-1"
      >
        <img
          src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
          alt={user?.name || 'User'}
          className="w-9 h-9 rounded-full border border-slate-200 object-cover shadow-xs"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-600 transition">
            {user?.name || 'Krishnendu Prasanth'}
          </span>
          <span className="text-[10px] text-slate-400 truncate">{user?.email || 'user@example.com'}</span>
        </div>
      </div>

      {/* Menu Item Groups */}
      <div className="space-y-0.5 text-xs font-medium text-slate-700">
        {/* Profile */}
        <button
          onClick={() => {
            onOpenProfileSettings();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition text-left"
        >
          <User className="w-4 h-4 text-slate-500" />
          <span>Profile</span>
        </button>

        {/* Admin Console */}
        <button
          onClick={() => {
            onOpenAdminConsole();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition text-left"
        >
          <Shield className="w-4 h-4 text-slate-500" />
          <span>Admin Console</span>
        </button>

        <div className="my-1 border-t border-slate-100" />

        {/* Trash */}
        <button
          onClick={() => {
            onOpenTrash();
            onClose();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 transition text-left"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>Trash</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Learning Center */}
        <button
          onClick={() => {
            onOpenLearningCenter();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition text-left"
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Learning Center</span>
        </button>

        {/* Product Overview & Landing */}
        {onOpenLanding && (
          <button
            onClick={() => {
              onOpenLanding();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition text-left"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Product Tour & Landing</span>
          </button>
        )}

        {/* iOS, Android, Desktop Apps */}
        <button
          onClick={() => {
            onOpenAppsModal();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition text-left"
        >
          <Smartphone className="w-4 h-4 text-slate-500" />
          <span>iOS, Android, Desktop Apps</span>
        </button>

        <div className="my-1 border-t border-slate-100" />

        {/* Developer Hub */}
        <button
          onClick={() => {
            onOpenDeveloperHub();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition text-left"
        >
          <Code className="w-4 h-4 text-slate-500" />
          <span>Developer Hub</span>
        </button>

        {/* SankalpLabs Marketplace */}
        <button
          onClick={() => {
            onOpenMarketplace();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition text-left"
        >
          <Zap className="w-4 h-4 text-slate-500" />
          <span>SankalpLabs Marketplace</span>
        </button>

        {/* Upgrade */}
        <button
          onClick={() => {
            onOpenUpgrade();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition text-left"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">Upgrade</span>
        </button>

        <div className="my-1 border-t border-slate-100" />

        {/* Log Out */}
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition text-left text-slate-700 font-medium"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-600" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};
