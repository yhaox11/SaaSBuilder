import React, { useState, useEffect } from 'react';
import { Search, UserPlus, MoreVertical, Shield, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { User } from '../types';
import { fetchUsers } from '../services/dataService';

interface UsersManagementProps {
  tenantId: string;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ tenantId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      const data = await fetchUsers(tenantId);
      setUsers(data);
      setIsLoading(false);
    };
    loadUsers();
  }, [tenantId]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'influencer': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'user': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
        case 'admin': return 'Admin';
        case 'influencer': return 'Influencer';
        case 'user': return 'Usuário';
        default: return role;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 pb-32 animate-fade-in-up">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Usuários</h1>
          <p className="text-zinc-500 mt-2">Gerencie o acesso e as permissões da sua organização.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors">
          <UserPlus size={18} />
          <span>Convidar Membro</span>
        </button>
      </header>

      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>{filteredUsers.length} usuários encontrados</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-[#111] border-b border-white/5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <div className="col-span-4">Usuário</div>
          <div className="col-span-3">Função (Role)</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Último Acesso</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>

        {/* Table Body */}
        {isLoading ? (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        ) : filteredUsers.length === 0 ? (
            <div className="text-center p-12 text-zinc-500">
                Nenhum usuário encontrado. Adicione dados ao seu banco de dados Supabase.
            </div>
        ) : (
            <div className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                
                {/* User Info */}
                <div className="col-span-4 flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full bg-zinc-800 object-cover" />
                    <div>
                    <div className="font-medium text-white text-sm">{user.name}</div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Mail size={10} />
                        {user.email}
                    </div>
                    </div>
                </div>

                {/* Role */}
                <div className="col-span-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                    <Shield size={10} />
                    {getRoleLabel(user.role)}
                    </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                    <div className="flex items-center gap-2">
                    {user.status === 'Active' ? (
                        <CheckCircle size={14} className="text-emerald-500" />
                    ) : (
                        <XCircle size={14} className="text-zinc-500" />
                    )}
                    <span className={`text-sm ${user.status === 'Active' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                        {user.status === 'Active' ? 'Ativo' : 'Inativo'}
                    </span>
                    </div>
                </div>

                {/* Last Active */}
                <div className="col-span-2 text-sm text-zinc-500">
                    {user.lastActive}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end">
                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors">
                    <MoreVertical size={16} />
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};