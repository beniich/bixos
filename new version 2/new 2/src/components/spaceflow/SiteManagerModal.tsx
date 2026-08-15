import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, MapPin, Check, X, Loader2 } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface Site {
  id: string;
  name: string;
  city: string;
  health: number;
  status: string;
  assets: {
    active: number;
    maintenance: number;
    broken: number;
  };
}

interface SiteManagerModalProps {
  sites: Site[];
  onClose: () => void;
}

export const SiteManagerModal: React.FC<SiteManagerModalProps> = ({ sites, onClose }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddSubmit = async () => {
    if (!name || !city) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'sites'), {
        name,
        city,
        health: 100,
        status: 'NORMAL',
        assets: { active: 0, maintenance: 0, broken: 0 },
        createdAt: serverTimestamp(),
      });
      setIsAdding(false);
      setName('');
      setCity('');
    } catch (error) {
      console.error('Error adding site:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (id: string) => {
    if (!name || !city) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'sites', id), {
        name,
        city,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
      setName('');
      setCity('');
    } catch (error) {
      console.error('Error updating site:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce site ?')) return;
    try {
      await deleteDoc(doc(db, 'sites', id));
    } catch (error) {
      console.error('Error deleting site:', error);
    }
  };

  const startEdit = (site: Site) => {
    setEditingId(site.id);
    setName(site.name);
    setCity(site.city);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setName('');
    setCity('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in text-white">
      <div className="bg-[#130826] border border-violet-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.2)]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-violet-400" />
            Gestion des Sites (Admin)
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {!isAdding && !editingId && (
            <button 
              onClick={() => { setIsAdding(true); setName(''); setCity(''); }}
              className="w-full py-3 border border-dashed border-violet-500/50 rounded-xl text-violet-400 hover:bg-violet-500/10 flex items-center justify-center gap-2 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" /> Ajouter un nouveau site
            </button>
          )}

          {isAdding && (
            <div className="p-4 rounded-xl bg-black/40 border border-violet-500/50 space-y-3">
              <h3 className="font-semibold text-violet-300">Nouveau site</h3>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Nom du site (ex: Paris HQ)" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm focus:border-violet-500 outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Ville (ex: Paris)" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm focus:border-violet-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={cancelEdit} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Annuler</button>
                <button 
                  onClick={handleAddSubmit} 
                  disabled={loading || !name || !city}
                  className="px-4 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Ajouter
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {sites.length === 0 && !isAdding && (
              <p className="text-center text-slate-500 text-sm py-4">Aucun site configuré.</p>
            )}
            
            {sites.map(s => (
              <div key={s.id}>
                {editingId === s.id ? (
                  <div className="p-4 rounded-xl bg-black/40 border border-violet-500/50 space-y-3 animate-fade-in">
                    <h3 className="font-semibold text-violet-300">Modifier {s.name}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Nom du site" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm focus:border-violet-500 outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Ville" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm focus:border-violet-500 outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={cancelEdit} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Annuler</button>
                      <button 
                        onClick={() => handleEditSubmit(s.id)} 
                        disabled={loading || !name || !city}
                        className="px-4 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-colors">
                    <div>
                      <h3 className="font-bold text-white text-base">{s.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {s.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(s)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors" title="Modifier">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-white/10 bg-black/50 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
