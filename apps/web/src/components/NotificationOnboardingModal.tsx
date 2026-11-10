import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Volume2,
  ShieldCheck,
  ArrowRight,
  Settings,
  X,
  Users,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NotificationOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted?: () => void;
}

export const NotificationOnboardingModal: React.FC<NotificationOnboardingModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [testSent, setTestSent] = useState(false);
  const [prefs, setPrefs] = useState({
    comments: true,
    collaborators: true,
    timer: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        localStorage.setItem('wb_notifications_enabled', 'true');
        onPermissionGranted?.();
        sendTestNotification();
      }
    } catch (e) {
      console.error('Failed to request permission:', e);
    }
  };

  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('SankalpLabs Whiteboard', {
          body: 'Notifications are active! You will receive live team alerts for comments & mentions.',
          icon: '/favicon.png',
        });
        setTestSent(true);
        setTimeout(() => setTestSent(false), 4000);
      } catch (e) {
        console.warn('Could not trigger Notification constructor:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="relative p-6 pb-5 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Stay in Sync with Your Team</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time collaborative alerts for your whiteboards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Permission Status Alert */}
          {permission === 'granted' ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Notifications are active!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  You're all set to receive instant updates when teammates edit, mention you, or join your rooms.
                </p>
                <button
                  onClick={sendTestNotification}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Test Notification</span>
                </button>
                {testSent && (
                  <span className="ml-2 text-xs text-emerald-600 font-medium">Test alert sent!</span>
                )}
              </div>
            </div>
          ) : permission === 'denied' ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-amber-800 space-y-1.5">
                <h4 className="font-bold text-amber-900 uppercase tracking-wider">Browser Permission is Blocked</h4>
                <p className="text-amber-700 leading-relaxed">
                  Your browser currently has notifications blocked for this domain. To unblock:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 bg-white/80 p-3 rounded-xl border border-amber-200/60 font-medium">
                  <li>Click the <strong>Tune / Padlock icon</strong> next to the URL in your address bar.</li>
                  <li>Find <strong>Notifications</strong> and toggle it to <strong>Allow</strong>.</li>
                  <li>Click <strong>Reload</strong> below to apply.</li>
                </ol>
                <div className="pt-1">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition shadow-2xs"
                  >
                    Reload Page to Check
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">One-Click Setup</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Click the button below and select <strong>"Allow"</strong> when your browser prompts you.
                </p>
              </div>
            </div>
          )}

          {/* Collaborative Perks */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">What you'll be notified for</h4>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Comment Mentions & Replies</div>
                    <div className="text-[11px] text-slate-500">When someone leaves sticky feedback or mentions @you</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.comments}
                  onChange={(e) => setPrefs({ ...prefs, comments: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Collaborator Joins & Invites</div>
                    <div className="text-[11px] text-slate-500">When a team member enters your board room</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.collaborators}
                  onChange={(e) => setPrefs({ ...prefs, collaborators: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Sprint Workshop Timers</div>
                    <div className="text-[11px] text-slate-500">Audio chime and desktop ping when room timer ends</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.timer}
                  onChange={(e) => setPrefs({ ...prefs, timer: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition"
          >
            {permission === 'granted' ? 'Done' : 'Maybe Later'}
          </button>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition"
            >
              <Bell className="w-4 h-4" />
              <span>Allow Notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {permission === 'granted' && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition"
            >
              Great, Let's Collaborate!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

