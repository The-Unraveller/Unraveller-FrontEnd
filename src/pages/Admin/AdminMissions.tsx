import React, { useState, useEffect } from 'react';
import { BookOpen, Edit3, Plus, Zap, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../services/api';

const AdminMissions: React.FC = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    xpReward: 0,
    systemPrompt: ''
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await apiClient.get('/Admin/missions');
      setMissions(res.data);
    } catch (err) {
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (mission: any) => {
    setSelectedMission(mission);
    setEditForm({
      title: mission.title,
      description: mission.description,
      xpReward: mission.xpReward,
      systemPrompt: mission.systemPrompt || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdateMission = async () => {
    if (!selectedMission) return;
    try {
      await apiClient.put(`/Admin/missions/${selectedMission.id}`, editForm);
      toast.success('Mission updated successfully');
      setIsModalOpen(false);
      fetchMissions();
    } catch (err) {
      toast.error('Failed to update mission');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">Mission Editor</h1>
          <p className="text-white/40 text-sm">Train your AI NPCs by adjusting prompts and rewards.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} /> Create Mission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10 text-white/30">Loading missions...</div>
        ) : missions.map(m => (
          <div key={m.id} className="ur-card rounded-2xl p-5 border border-white/5 hover:border-purple-brand/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="badge badge-purple text-[10px] mb-2 block w-fit">{m.stage}</span>
                <h3 className="font-bold text-white text-lg group-hover:text-purple-brand transition-colors">{m.title}</h3>
              </div>
              <button
                onClick={() => openEditModal(m)}
                className="p-2 text-white/30 hover:text-white transition-colors"
              >
                <Edit3 size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <Zap size={12} className="text-xp-orange" />
                <span>Reward: <strong className="text-white">{m.xpReward} XP</strong></span>
              </div>
              <p className="text-white/40 text-xs line-clamp-2 italic">
                "{m.description}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Mission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-2 border border-purple-brand/30 rounded-3xl w-full max-w-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold text-white">Edit Mission: {selectedMission?.title}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Mission Title</label>
                  <input
                    type="text"
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand"
                    value={editForm.title}
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand resize-none"
                    value={editForm.description}
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">XP Reward</label>
                  <input
                    type="number"
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand"
                    value={editForm.xpReward}
                    onChange={e => setEditForm({...editForm, xpReward: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium">AI System Prompt (NPC Behavior)</label>
                <textarea
                  rows={12}
                  className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand font-mono text-xs leading-relaxed"
                  value={editForm.systemPrompt}
                  onChange={e => setEditForm({...editForm, systemPrompt: e.target.value})}
                  placeholder="Define how the NPC acts, their goal, and what they should evaluate in the player's English..."
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMission}
                className="flex-1 py-2.5 rounded-xl bg-purple-brand text-white text-sm font-bold shadow-glow-purple hover:brightness-110 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMissions;
