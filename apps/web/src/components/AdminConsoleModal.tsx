import React, { useState } from 'react';
import { X, Shield, UserPlus, Users, Key, Settings, Check, Mail } from 'lucide-react';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  avatarUrl: string;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({ isOpen, onClose }) => {
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'Krishnendu Prasanth',
      email: 'krishnendu@example.com',
      role: 'OWNER',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Krishnendu',
    },
    {
      id: '2',
      name: 'Demo Admin',
      email: 'admin@aiplan.com',
      role: 'ADMIN',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
    {
      id: '3',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'MEMBER',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  if (!isOpen) return null;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'MEMBER',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteEmail}`,
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 pointer-events-auto select-none">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Admin Console</h3>
              <p className="text-xs text-slate-400">Workspace Member Permissions & Security Controls</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite Form */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <form onSubmit={handleInvite} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Enter member email to invite..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              {inviteSent ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{inviteSent ? 'Invited!' : 'Invite Member'}</span>
            </button>
          </form>
        </div>

        {/* Members List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Workspace Members ({members.length})</h4>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border border-slate-200" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-slate-800">{m.name}</span>
                    <span className="text-[10px] text-slate-400">{m.email}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    m.role === 'OWNER'
                      ? 'bg-purple-50 text-purple-600 border border-purple-200'
                      : m.role === 'ADMIN'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
