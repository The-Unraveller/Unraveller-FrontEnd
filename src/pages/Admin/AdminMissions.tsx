import * as React from 'react';
import { useState, useEffect } from 'react';
import { BookOpen, Edit3, Plus, Zap, X, Check, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient, getModeratorNpcs, createModeratorNpc } from '../../services/api';
import type { NpcDto, NpcCreateDto } from '../../services/api';
import { useGameStore } from '../../store/useGameStore';
import Seo from '../../components/seo/Seo';

const AdminMissions: React.FC = () => {
  const { user } = useGameStore();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  
  const [editForm, setEditForm] = useState({
    title: '',
    goal: '',
    description: '',
    stage: 'Stage 1',
    difficulty: 'Beginner',
    xpReward: 150,
    npcId: 1,
    imageUrl: ''
  });

  const [npcs, setNpcs] = useState<NpcDto[]>([]);
  const [subTasks, setSubTasks] = useState<any[]>([]);

  // Sub-modal for quick NPC creation
  const [isNpcModalOpen, setIsNpcModalOpen] = useState(false);
  const [npcForm, setNpcForm] = useState({
    name: '',
    role: '',
    npcEmoji: '☕',
    description: '',
    personality: ''
  });
  const [savingNpc, setSavingNpc] = useState(false);

  useEffect(() => {
    fetchMissions();
    fetchNpcs();
  }, [user]);

  const fetchNpcs = async () => {
    try {
      const data = await getModeratorNpcs();
      setNpcs(data);
    } catch (err) {
      console.error("Failed to load NPCs dynamically, using defaults", err);
      setNpcs([
        { id: 1, name: 'Barista', role: 'Barista', npcEmoji: '☕', description: '', personality: '' },
        { id: 2, name: 'Supervisor', role: 'Supervisor', npcEmoji: '📋', description: '', personality: '' },
        { id: 3, name: 'Chief Detective', role: 'Chief Detective', npcEmoji: '🔍', description: '', personality: '' }
      ]);
    }
  };

  const handleQuickCreateNpc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!npcForm.name.trim() || !npcForm.role.trim()) {
      toast.error("NPC Name and Role are required");
      return;
    }
    try {
      setSavingNpc(true);
      const newNpc = await createModeratorNpc(npcForm);
      toast.success(`Created NPC: ${newNpc.name}`);
      setNpcs(prev => [...prev, newNpc]);
      setEditForm(prev => ({ ...prev, npcId: newNpc.id }));
      setIsNpcModalOpen(false);
      setNpcForm({
        name: '',
        role: '',
        npcEmoji: '☕',
        description: '',
        personality: ''
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create NPC");
    } finally {
      setSavingNpc(false);
    }
  };

  const fetchMissions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const endpoint = user.role === 'Admin' ? '/Admin/missions' : '/Moderator/missions';
      const res = await apiClient.get(endpoint);
      setMissions(res.data);
    } catch (err) {
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    if (submitting) return;
    setIsCreateMode(true);
    setSelectedMission(null);
    setEditForm({
      title: '',
      goal: '',
      description: '',
      stage: 'Stage 1',
      difficulty: 'Beginner',
      xpReward: 150,
      npcId: 1,
      imageUrl: ''
    });
    setSubTasks([]);
    setIsModalOpen(true);
  };

  const openEditModal = (mission: any) => {
    if (submitting) return;
    setIsCreateMode(false);
    setSelectedMission(mission);
    setEditForm({
      title: mission.title,
      goal: mission.goal || '',
      description: mission.description,
      stage: mission.stage || 'Stage 1',
      difficulty: mission.difficulty || 'Beginner',
      xpReward: mission.xpReward,
      npcId: mission.npcId || 1,
      imageUrl: mission.imageUrl || ''
    });
    setSubTasks(mission.subTasks || []);
    setIsModalOpen(true);
  };

  const handleSaveMission = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (isCreateMode) {
        // Moderator submits mission to Moderator Controller with parsed subtasks
        const payload = {
          ...editForm,
          subTasks: subTasks.map(st => ({
            label: st.label,
            labelEn: st.labelEn,
            hintPhrase: st.hintPhrase,
            triggerKeywords: typeof st.triggerKeywords === 'string'
              ? st.triggerKeywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
              : st.triggerKeywords || [],
            isOptional: !!st.isOptional,
            xpBonus: parseInt(st.xpBonus) || 0
          }))
        };
        await apiClient.post('/Moderator/missions', payload);
        toast.success('Mission submitted for approval');
      } else {
        // Update mission
        await apiClient.put(`/Admin/missions/${selectedMission.id}`, editForm);
        toast.success('Mission updated successfully');
      }
      setIsModalOpen(false);
      fetchMissions();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save mission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await apiClient.post(`/Admin/missions/${id}/approve`);
      toast.success('Mission approved successfully');
      fetchMissions();
    } catch (err) {
      toast.error('Failed to approve mission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Please enter a reason for rejecting this mission:');
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      toast.error('A rejection reason is required.');
      return;
    }

    if (submitting) return;
    try {
      setSubmitting(true);
      await apiClient.post(`/Admin/missions/${id}/reject`, { reason });
      toast.success('Mission rejected successfully');
      fetchMissions();
    } catch (err) {
      toast.error('Failed to reject mission');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/20 text-green-400">✅ Đã duyệt</span>;
      case 1:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-500/20 text-yellow-400 animate-pulse">⏳ Chờ duyệt</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400">❌ Bị từ chối</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <Seo title="Quan Ly Nhiem Vu" description="Tao va chinh sua nhiem vu trong The Unraveller." keywords="admin, nhiem vu, kich ban" canonical="/admin/missions" noIndex />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">
            {user?.role === 'Admin' ? '🛡️ Quản lý nhiệm vụ' : '⚙️ Tạo nhiệm vụ'}
          </h1>
          <p className="text-white/40 text-sm">
            {user?.role === 'Admin' 
              ? 'Xem xét và duyệt các nhiệm vụ do Moderator gửi lên.' 
              : 'Tạo nhiệm vụ mới và gửi cho Admin xét duyệt.'}
          </p>
        </div>
        {/* Only Moderators can create new missions */}
        {user?.role === 'Moderator' && (
          <button 
            onClick={openCreateModal}
            disabled={submitting}
            className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Tạo nhiệm vụ
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-10 text-white/30 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-brand" />
            Loading missions...
          </div>
        ) : missions.length === 0 ? (
          <div className="col-span-full text-center py-10 text-white/30">Chưa có nhiệm vụ nào.</div>
        ) : missions.map(m => (
          <div key={m.id} className="ur-card rounded-2xl p-5 border border-white/5 hover:border-purple-brand/30 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="badge badge-purple text-[10px] block w-fit leading-none">{m.stage || 'Stage X'}</span>
                    {getStatusBadge(m.approvalStatus)}
                  </div>
                  <h3 className="font-bold text-white text-lg group-hover:text-purple-brand transition-colors leading-tight">{m.title}</h3>
                </div>
                <button
                  onClick={() => openEditModal(m)}
                  disabled={submitting}
                  className="p-2 text-white/30 hover:text-white transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Edit properties"
                >
                  <Edit3 size={16} />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-white/50 text-xs font-mono">
                  <span>NPC:</span>
                  <span className="text-white">{m.npcEmoji || '☕'} {m.npcName || 'Barista'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Zap size={12} className="text-xp-orange" />
                  <span>Reward: <strong className="text-white">{m.xpReward} XP</strong></span>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40 text-xs italic line-clamp-2">
                    "{m.description}"
                  </p>
                  {m.goal && (
                    <p className="text-white/35 text-[10px] font-mono truncate">
                      Goal: {m.goal}
                    </p>
                  )}
                </div>

                {m.subTasks && m.subTasks.length > 0 && (
                  <div className="mt-3 space-y-1 bg-navy-3/45 border border-white/5 rounded-xl p-2.5">
                    <p className="text-[10px] text-purple-light font-bold uppercase tracking-wider">Nhiệm vụ con ({m.subTasks.length}):</p>
                    <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1 select-none">
                      {m.subTasks.map((s: any) => (
                        <li key={s.id || s.orderIndex} className="text-xs flex items-start gap-1.5 text-white/60">
                          <span className="text-[9px] px-1 bg-purple-brand/20 border border-purple-brand/35 rounded mt-0.5 font-mono">#{s.orderIndex}</span>
                          <div className="flex-1">
                            <p className="font-medium text-white/80 leading-tight">{s.label} <span className="text-white/40 text-[10px]">({s.labelEn})</span></p>
                            {s.hintPhrase && <p className="text-[10px] text-white/40 italic">Hint: {s.hintPhrase}</p>}
                            {s.triggerKeywords && s.triggerKeywords.length > 0 && (
                              <p className="text-[9px] text-purple-light/95 font-mono">Keywords: {s.triggerKeywords.join(', ')}</p>
                            )}
                            <div className="flex gap-2 mt-0.5 text-[9px] text-white/40 font-mono">
                              <span>Optional: {s.isOptional ? 'Yes' : 'No'}</span>
                              <span>•</span>
                              <span className="text-xp-orange/70">Bonus: +{s.xpBonus} XP</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.approvalStatus === 2 && m.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Lý do từ chối:</span> {m.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Action Buttons for Pending Items */}
            {user?.role === 'Admin' && m.approvalStatus === 1 && (
              <div className="pt-4 border-t border-white/5 flex gap-2 mt-auto">
                <button
                  onClick={() => handleApprove(m.id)}
                  disabled={submitting}
                  className="flex-1 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-green-500/30 shadow-glow-green/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang duyệt...
                    </>
                  ) : (
                    <>
                      <Check size={12} /> Duyệt
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReject(m.id)}
                  disabled={submitting}
                  className="flex-1 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang từ chối...
                    </>
                  ) : (
                    <>
                      <XCircle size={12} /> Từ chối
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit/Create Mission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-2 border border-purple-brand/30 rounded-3xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold text-white">
                {isCreateMode ? '📝 Tạo nhiệm vụ mới' : `✏️ Chỉnh sửa: ${selectedMission?.title}`}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                disabled={submitting}
                className="p-2 text-white/40 hover:text-white transition-colors disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Mission Title</label>
                  <input
                    type="text"
                    disabled={submitting}
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50"
                    value={editForm.title}
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    placeholder="e.g. Cafe Conundrums"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Stage Name</label>
                  <input
                    type="text"
                    disabled={submitting}
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50"
                    value={editForm.stage}
                    onChange={e => setEditForm({...editForm, stage: e.target.value})}
                    placeholder="e.g. Stage 1, Sidequest"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Difficulty Level</label>
                  <select
                    disabled={submitting}
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50"
                    value={editForm.difficulty}
                    onChange={e => setEditForm({...editForm, difficulty: e.target.value})}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">XP Reward</label>
                  <input
                    type="number"
                    disabled={submitting}
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50"
                    value={editForm.xpReward}
                    onChange={e => setEditForm({...editForm, xpReward: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white/40 font-medium">Select NPC</label>
                    <button
                      type="button"
                      onClick={() => setIsNpcModalOpen(true)}
                      className="text-[10px] text-purple-light hover:text-white transition-colors font-bold flex items-center gap-0.5"
                    >
                      <Plus size={10} /> Thêm nhanh NPC
                    </button>
                  </div>
                  <select
                    disabled={submitting}
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50"
                    value={editForm.npcId}
                    onChange={e => setEditForm({...editForm, npcId: parseInt(e.target.value) || 1})}
                  >
                    {npcs.map(npc => (
                      <option key={npc.id} value={npc.id}>
                        {npc.name} ({npc.role} - {npc.npcEmoji})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">Description</label>
                  <textarea
                    rows={3}
                    disabled={submitting}
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand resize-none disabled:opacity-50"
                    value={editForm.description}
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Enter context that players see when initiating roleplay..."
                  />
                  <p className="text-[10px] text-white/30 leading-tight">
                    💡 Mô tả bối cảnh hoặc lời thoại khởi đầu của nhân vật (Ví dụ: *The barista smiles* "Hi! How can I help you today?")
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 font-medium">NPC Secret Goal</label>
                  <textarea
                    rows={3}
                    disabled={submitting}
                    className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand resize-none disabled:opacity-50"
                    value={editForm.goal}
                    onChange={e => setEditForm({...editForm, goal: e.target.value})}
                    placeholder="Specify the hidden objective or criteria for the NPC..."
                  />
                </div>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    🎯 Nhiệm vụ con (Subtasks) {isCreateMode ? `(${subTasks.length})` : ''}
                  </h3>
                  {isCreateMode && (
                    <p className="text-[10px] text-white/40 mt-0.5">
                      Thêm các thử thách phụ/chính mà người học cần hoàn thành trong cuộc hội thoại.
                    </p>
                  )}
                </div>
                {isCreateMode && (
                  <button
                    type="button"
                    onClick={() => setSubTasks(prev => [...prev, {
                      label: '',
                      labelEn: '',
                      hintPhrase: '',
                      triggerKeywords: '',
                      isOptional: false,
                      xpBonus: 10
                    }])}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-purple-light hover:text-white border border-purple-brand/20 hover:border-purple-brand/50 rounded-xl bg-navy-3 hover:bg-navy-3/80 transition-all font-semibold"
                  >
                    <Plus size={14} /> Thêm subtask
                  </button>
                )}
              </div>

              {subTasks.length === 0 ? (
                <div className="text-center py-4 bg-white/2 rounded-2xl border border-dashed border-white/5 text-white/30 text-xs">
                  {isCreateMode ? 'Chưa có nhiệm vụ con nào. Nhấn "Thêm subtask" để bắt đầu.' : 'Nhiệm vụ này không có nhiệm vụ con.'}
                </div>
              ) : (
                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1">
                  {subTasks.map((st, idx) => (
                    <div key={idx} className="bg-navy-3/50 border border-white/5 rounded-2xl p-4 space-y-3 relative group/subtask">
                      {isCreateMode && (
                        <button
                          type="button"
                          onClick={() => setSubTasks(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-3 right-3 p-1.5 text-white/30 hover:text-red-400 transition-colors rounded-lg bg-white/2 hover:bg-red-500/10 border border-white/5"
                          title="Xoá subtask"
                        >
                          <X size={14} />
                        </button>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-purple-brand/20 border border-purple-brand/30 rounded-lg text-purple-brand-light">
                          Subtask #{idx + 1}
                        </span>
                      </div>

                      {isCreateMode ? (
                        // Editable Form for Moderator in Create Mode
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-white/40 font-medium block">Tên tiếng Việt</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Gọi món nước"
                              className="w-full bg-navy-2 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-brand outline-none"
                              value={st.label}
                              onChange={e => {
                                const newSts = [...subTasks];
                                newSts[idx].label = e.target.value;
                                setSubTasks(newSts);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-white/40 font-medium block">Tên tiếng Anh (English Label)</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Order a drink"
                              className="w-full bg-navy-2 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-brand outline-none"
                              value={st.labelEn}
                              onChange={e => {
                                const newSts = [...subTasks];
                                newSts[idx].labelEn = e.target.value;
                                setSubTasks(newSts);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-white/40 font-medium block">Gợi ý câu tiếng Anh (Hint Phrase)</label>
                            <input
                              type="text"
                              placeholder="e.g. Could I have a latte, please?"
                              className="w-full bg-navy-2 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-brand outline-none"
                              value={st.hintPhrase}
                              onChange={e => {
                                const newSts = [...subTasks];
                                newSts[idx].hintPhrase = e.target.value;
                                setSubTasks(newSts);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-white/40 font-medium block">Keywords kích hoạt (phân cách bằng dấu phẩy)</label>
                            <input
                              type="text"
                              placeholder="e.g. order, drink, like to have, latte"
                              className="w-full bg-navy-2 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-brand outline-none font-mono"
                              value={st.triggerKeywords}
                              onChange={e => {
                                const newSts = [...subTasks];
                                newSts[idx].triggerKeywords = e.target.value;
                                setSubTasks(newSts);
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between md:col-span-2 pt-1.5 border-t border-white/5 mt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-white/60 hover:text-white select-none">
                              <input
                                type="checkbox"
                                className="rounded border-white/10 text-purple-brand bg-navy-2 focus:ring-0 focus:ring-offset-0"
                                checked={st.isOptional}
                                onChange={e => {
                                  const newSts = [...subTasks];
                                  newSts[idx].isOptional = e.target.checked;
                                  setSubTasks(newSts);
                                }}
                              />
                              Nhiệm vụ không bắt buộc (Optional)
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/40 font-medium">XP thưởng thêm:</span>
                              <input
                                type="number"
                                className="w-16 bg-navy-2 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-purple-brand text-right font-mono"
                                value={st.xpBonus}
                                onChange={e => {
                                  const newSts = [...subTasks];
                                  newSts[idx].xpBonus = parseInt(e.target.value) || 0;
                                  setSubTasks(newSts);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Read-only view of existing subtasks for Admin or Moderator in View Mode
                        <div className="space-y-1 text-xs text-white/60">
                          <p><strong className="text-white">Việt:</strong> {st.label}</p>
                          <p><strong className="text-white">Anh:</strong> {st.labelEn}</p>
                          {st.hintPhrase && <p><strong className="text-white">Gợi ý:</strong> {st.hintPhrase}</p>}
                          <p><strong className="text-white">Keywords:</strong> <code className="text-purple-light font-mono">{Array.isArray(st.triggerKeywords) ? st.triggerKeywords.join(', ') : st.triggerKeywords}</code></p>
                          <div className="flex gap-4 pt-1.5 text-[10px] text-white/45 font-mono">
                            <span>Bắt buộc: {st.isOptional ? 'Không' : 'Có'}</span>
                            <span>Thưởng thêm: <strong className="text-xp-orange">+{st.xpBonus} XP</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Huỷ
              </button>
              <button
                onClick={handleSaveMission}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-purple-brand text-white text-sm font-bold shadow-glow-purple hover:brightness-110 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  isCreateMode ? 'Gửi để duyệt' : 'Lưu thay đổi'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick NPC Create Modal */}
      {isNpcModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-2 border border-purple-brand/40 rounded-3xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[85vh] relative">
            <button 
              onClick={() => setIsNpcModalOpen(false)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              disabled={savingNpc}
              type="button"
            >
              <X size={16} />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-heading font-bold text-white">➕ Tạo nhanh NPC</h3>
              <p className="text-white/40 text-[11px] mt-0.5">Tạo nhanh nhân vật mới để sử dụng trong nhiệm vụ này.</p>
            </div>

            <form onSubmit={handleQuickCreateNpc} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] text-white/40 font-semibold block">Emoji</label>
                  <div className="w-full h-16 rounded-xl bg-navy-3 border border-white/10 flex items-center justify-center text-3xl shadow-inner select-none">
                    {npcForm.npcEmoji}
                  </div>
                </div>

                <div className="col-span-2 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 font-semibold block">Tên nhân vật</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Guard Lee"
                      className="bg-navy-3 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-brand outline-none transition-all w-full"
                      value={npcForm.name}
                      onChange={(e) => setNpcForm({ ...npcForm, name: e.target.value })}
                      disabled={savingNpc}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 font-semibold block">Vai trò (Role)</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Gate Guard"
                      className="bg-navy-3 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-brand outline-none transition-all w-full"
                      value={npcForm.role}
                      onChange={(e) => setNpcForm({ ...npcForm, role: e.target.value })}
                      disabled={savingNpc}
                    />
                  </div>
                </div>
              </div>

              {/* Emoji Picker Row */}
              <div className="space-y-1">
                <label className="text-[10px] text-white/40 font-semibold block">Chọn Emoji nhanh</label>
                <div className="flex flex-wrap gap-1 p-2 bg-navy-3 border border-white/10 rounded-xl max-h-16 overflow-y-auto">
                  {['☕', '📋', '🔍', '💂', '👩‍⚕️', '🕵️', '🤖', '😎', '🦸', '🧑‍🍳', '🧙', '👽'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNpcForm({ ...npcForm, npcEmoji: emoji })}
                      className={`text-lg p-0.5 rounded transition-all hover:bg-white/10 ${npcForm.npcEmoji === emoji ? 'bg-purple-brand/20 border border-purple-brand/40 scale-105' : 'opacity-65'}`}
                      disabled={savingNpc}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 font-semibold block">Mô tả ngữ cảnh (Description)</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Mô tả nơi người học gặp NPC..."
                  className="bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-brand outline-none transition-all w-full resize-none leading-relaxed"
                  value={npcForm.description}
                  onChange={(e) => setNpcForm({ ...npcForm, description: e.target.value })}
                  disabled={savingNpc}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 font-semibold block">Tính cách & Prompt cho AI (Personality)</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Cung cách nói chuyện và quy tắc AI..."
                  className="bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-brand outline-none transition-all w-full resize-none leading-relaxed font-mono"
                  value={npcForm.personality}
                  onChange={(e) => setNpcForm({ ...npcForm, personality: e.target.value })}
                  disabled={savingNpc}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNpcModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all"
                  disabled={savingNpc}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-purple-brand text-white hover:bg-purple-light text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  disabled={savingNpc}
                >
                  {savingNpc ? <Loader2 size={12} className="animate-spin" /> : 'Tạo NPC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMissions;
