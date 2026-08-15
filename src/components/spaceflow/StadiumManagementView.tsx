import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../services/firebase';
import { Plus, Trash2, Edit2, Save, X, Map, Users, Image as ImageIcon, ChevronRight, Activity, Shield } from 'lucide-react';

interface Sector {
  id: string;
  name: string;
  color: string;
  seatCount: number;
  basePrice: number;
}

interface Stadium {
  id: string;
  name: string;
  seatingCapacity: number;
  floorPlanImage: string;
  sectors: Sector[];
  createdAt?: string;
  updatedAt?: string;
}

export const StadiumManagementView: React.FC = () => {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Stadium>>({
    name: '',
    seatingCapacity: 0,
    floorPlanImage: '',
    sectors: []
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'stadiums'), (snapshot) => {
      const data: Stadium[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as Stadium);
      });
      setStadiums(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'stadiums');
    });

    return () => unsub();
  }, []);

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({
      name: '',
      seatingCapacity: 0,
      floorPlanImage: '',
      sectors: []
    });
  };

  const handleEdit = (stadium: Stadium) => {
    setEditingId(stadium.id);
    setFormData({
      name: stadium.name,
      seatingCapacity: stadium.seatingCapacity,
      floorPlanImage: stadium.floorPlanImage,
      sectors: stadium.sectors || []
    });
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        const newRef = doc(collection(db, 'stadiums'));
        await setDoc(newRef, {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else if (editingId) {
        const ref = doc(db, 'stadiums', editingId);
        await updateDoc(ref, {
          ...formData,
          updatedAt: serverTimestamp()
        });
      }
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'stadiums');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this stadium?')) {
      try {
        await deleteDoc(doc(db, 'stadiums', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'stadiums');
      }
    }
  };

  const addSector = () => {
    setFormData(prev => ({
      ...prev,
      sectors: [
        ...(prev.sectors || []),
        { id: Math.random().toString(36).substring(7), name: '', color: '#00f0ff', seatCount: 0, basePrice: 0 }
      ]
    }));
  };

  const updateSector = (id: string, field: keyof Sector, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors?.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeSector = (id: string) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors?.filter(s => s.id !== id)
    }));
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#06080e] font-sans text-slate-300">
      <div className="p-8 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Map className="text-cyan-400" />
              Stadium Builder Engine
            </h1>
            <p className="text-slate-500 font-mono text-sm">Create and manage multi-arena environments in Firestore DB</p>
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 px-4 py-2 rounded-xl font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            New Stadium
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List of Stadiums */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Deployed Stadiums</h2>
            
            {loading ? (
              <div className="p-8 text-center text-slate-600 animate-pulse">Loading database...</div>
            ) : stadiums.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed text-slate-500">
                No stadiums deployed yet.
              </div>
            ) : (
              stadiums.map(stadium => (
                <div 
                  key={stadium.id} 
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group ${editingId === stadium.id ? 'bg-cyan-950/20 border-cyan-800/50' : 'bg-[#0a0d14] border-slate-800/50 hover:border-slate-700'}`}
                  onClick={() => handleEdit(stadium)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{stadium.name}</h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(stadium.id); }}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      {stadium.seatingCapacity.toLocaleString()} Seats
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      {stadium.sectors?.length || 0} Sectors
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Editor */}
          <div className="lg:col-span-2">
            {editingId ? (
              <div className="bg-[#0a0d14] rounded-2xl border border-slate-800/50 shadow-2xl p-6 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {editingId === 'new' ? 'Deploy New Stadium' : 'Configure Stadium'}
                  </h2>
                  <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* General Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stadium Name</label>
                      <input 
                        type="text" 
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="e.g. Neo Tokyo Arena"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Total Capacity</label>
                      <input 
                        type="number" 
                        value={formData.seatingCapacity || 0}
                        onChange={e => setFormData({ ...formData, seatingCapacity: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Floor Plan Image URL</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          value={formData.floorPlanImage || ''}
                          onChange={e => setFormData({ ...formData, floorPlanImage: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Sectors Manager */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Sector Configurations</h3>
                        <p className="text-xs text-slate-500">Define seating blocks, tiers, and pricing</p>
                      </div>
                      <button 
                        onClick={addSector}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Sector
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.sectors?.length === 0 && (
                        <div className="text-center p-6 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed text-slate-500 text-sm">
                          No sectors defined. Add a sector to begin mapping seats.
                        </div>
                      )}
                      {formData.sectors?.map((sector, idx) => (
                        <div key={sector.id} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-slate-900 p-4 rounded-xl border border-slate-800">
                          <div className="flex-1 min-w-[120px]">
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Sector Name</label>
                            <input 
                              type="text"
                              value={sector.name}
                              onChange={(e) => updateSector(sector.id, 'name', e.target.value)}
                              className="w-full bg-[#0a0d14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                              placeholder="e.g. VIP Box"
                            />
                          </div>
                          <div className="w-24">
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Capacity</label>
                            <input 
                              type="number"
                              value={sector.seatCount}
                              onChange={(e) => updateSector(sector.id, 'seatCount', parseInt(e.target.value) || 0)}
                              className="w-full bg-[#0a0d14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                            />
                          </div>
                          <div className="w-24">
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Base Price ($)</label>
                            <input 
                              type="number"
                              value={sector.basePrice}
                              onChange={(e) => updateSector(sector.id, 'basePrice', parseFloat(e.target.value) || 0)}
                              className="w-full bg-[#0a0d14] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                            />
                          </div>
                          <div className="w-16">
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Color</label>
                            <input 
                              type="color"
                              value={sector.color}
                              onChange={(e) => updateSector(sector.id, 'color', e.target.value)}
                              className="w-full h-[38px] rounded cursor-pointer bg-transparent border-0 p-0"
                            />
                          </div>
                          <button 
                            onClick={() => removeSector(sector.id)}
                            className="p-2 text-slate-600 hover:text-red-400 bg-[#0a0d14] rounded-lg border border-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-800/50">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-5 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
                    >
                      <Save className="w-4 h-4" />
                      {editingId === 'new' ? 'Deploy to DB' : 'Save Changes'}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800/50 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-slate-900/10">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                  <Map className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Select a Stadium</h3>
                <p className="text-slate-500 max-w-sm mb-6">Choose an existing stadium from the list to modify its configuration, or create a new one to deploy to the database.</p>
                <button 
                  onClick={handleAddNew}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  Create New Stadium
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
