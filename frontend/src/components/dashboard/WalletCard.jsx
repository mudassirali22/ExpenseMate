import React from 'react';
import { 
  Package, Edit3, Trash2, Home, Plane, Key, Utensils, Bolt, Film, 
  Handshake, CheckCircle2 
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Household', icon: Home },
  { name: 'Travel', icon: Plane },
  { name: 'Rent', icon: Key },
  { name: 'Dining', icon: Utensils },
  { name: 'Utilities', icon: Bolt },
  { name: 'Entertainment', icon: Film },
  { name: 'Other', icon: Package },
];

const WalletCard = ({ 
  wallet, isSelected, onSelect, onEdit, onDelete, onInvite, onAddMoney, onDetails, 
  onInlineSave, onInlineCancel, editingId, editFormData, setEditFormData, isSavingInline,
  currentUser, currencySymbol 
}) => {
  const isEditing = editingId === wallet._id;
  const isOwner = currentUser?._id === wallet.createdBy?._id;
  const Icon = CATEGORIES.find(c => c.name === (isEditing ? editFormData.category : wallet.category))?.icon || Package;

  return (
    <div 
      onClick={() => onSelect(wallet)}
      className={`stat-card flex flex-col h-full cursor-pointer group transition-all duration-300 ${isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.01]' : 'border-glass-border hover:border-primary/20'}`}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-xl shadow-inner border border-glass-border text-primary">
            {isEditing ? (
              <div className="relative">
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
                <Icon size={20} />
              </div>
            ) : <Icon size={20} />}
          </div>
          <div className="min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="input-field !py-1 !text-sm font-extrabold"
              />
            ) : (
              <><h4 className="text-md font-extrabold text-on-surface truncate pr-2">{wallet.name}</h4><p className="text-[10px] font-bold text-primary uppercase tracking-widest">{wallet.category}</p></>
            )}
          </div>
        </div>

        {!isEditing && isOwner && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onEdit(wallet); }} className="p-2 text-on-surface-variant hover:text-primary transition-colors"><Edit3 size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(wallet._id); }} className="p-2 text-on-surface-variant hover:text-error transition-colors"><Trash2 size={14} /></button>
          </div>
        )}
      </div>

      <div className="bg-surface-container/50 p-4 rounded-xl border border-glass-border mb-6">
        <div className="flex justify-between items-center mb-1.5 px-0.5">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Saved Progress</span>
          {isEditing ? (
            <input type="number" value={editFormData.totalBalance} onChange={(e) => setEditFormData({ ...editFormData, totalBalance: e.target.value })} className="input-field !py-0.5 !text-xs w-24 text-right" />
          ) : (
            <span className="text-xs font-bold">{currencySymbol} {(wallet.totalBalance || 0).toLocaleString()} / {currencySymbol} {(wallet.targetBudget || 0).toLocaleString()}</span>
          )}
        </div>
        <div className="progress-bar !h-2 bg-background relative overflow-hidden">
          <div className={`progress-fill ${(wallet.totalBalance || 0) >= (wallet.targetBudget || 0) ? 'bg-success' : 'bg-primary'}`} style={{ width: `${Math.min(100, ((wallet.totalBalance || 0) / (wallet.targetBudget || 1)) * 100)}%` }} />
        </div>
        {isEditing ? (
          <textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} rows="2" className="input-field !text-[10px] mt-3 resize-none italic" />
        ) : wallet.description && <p className="text-[10px] font-medium text-on-surface-variant mt-3 opacity-80 italic line-clamp-2">"{wallet.description}"</p>}
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto max-h-[180px] custom-scrollbar pr-1 mb-6">
        {wallet.members.map((member, i) => {
          const isMe = member.user?._id === currentUser?._id || member.email === currentUser?.email;
          const share = (wallet.targetBudget || 0) / (wallet.members.length || 1);
          const paid = member.totalPaid || 0;
          const left = Math.max(0, share - paid);
          const progress = (paid / (share || 1)) * 100;

          return (
            <div key={i} className={`p-3 rounded-xl border ${isMe ? 'bg-primary/5 border-primary/20' : 'bg-surface-container/20 border-glass-border'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-container border border-glass-border flex items-center justify-center text-[10px] font-black shrink-0">
                    {member.user?.fullName?.charAt(0) || member.email?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate pr-1">{isMe ? 'Me' : (member.user?.fullName || member.email.split('@')[0])}</p>
                    <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">{member.status}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {left > 0 ? <p className="text-[9px] font-bold text-error uppercase">Left: {currencySymbol}{Math.round(left)}</p> : <p className="text-[9px] font-bold text-success flex items-center gap-1 justify-end uppercase"><CheckCircle2 size={10} /> Settled</p>}
                </div>
              </div>
              <div className="progress-bar !h-1 bg-background overflow-hidden relative"><div className={`progress-fill ${left === 0 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${Math.min(100, progress)}%` }} /></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-auto pt-6 border-t border-glass-border border-dashed shrink-0">
        {isEditing ? (
          <><button onClick={(e) => { e.stopPropagation(); onInlineSave(wallet._id); }} disabled={isSavingInline} className="col-span-2 btn btn-primary text-[10px] py-2.5 uppercase tracking-widest">{isSavingInline ? 'SAVING...' : 'SAVE CHANGES'}</button><button onClick={(e) => { e.stopPropagation(); onInlineCancel(); }} className="btn btn-outline text-[10px] py-2.5 uppercase tracking-widest">CANCEL</button></>
        ) : (
          <><button onClick={(e) => { e.stopPropagation(); onInvite(wallet); }} className="btn btn-outline text-[10px] py-2.5 font-bold">INVITE</button><button onClick={(e) => { e.stopPropagation(); onAddMoney(wallet); }} className="btn btn-outline text-[10px] py-2.5 font-bold">DEPOSIT</button><button onClick={(e) => { e.stopPropagation(); onDetails(wallet._id); }} className="btn btn-primary text-[10px] py-2.5 font-bold">DETAILS</button></>
        )}
      </div>
    </div>
  );
};

export default WalletCard;
