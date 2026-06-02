import React, { useState, useEffect } from 'react';
import { Plus, Edit3, X, Loader2, User, Smile, MessageSquare, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import { getModeratorNpcs, createModeratorNpc, updateModeratorNpc } from '../../services/api';
import type { NpcDto } from '../../services/api';

const EMOJI_OPTIONS = [
  '☕', '📋', '🔍', '💂', '👩‍⚕️', '🕵️', '🤖', '😎', '🦸', '🧛', '🧑‍🍳', '🧙', '👽', '💀', '💼', '👮', '🧑‍🏫', '🚀'
];

const AdminNpcs: React.FC = () => {
  const [npcs, setNpcs] = useState<NpcDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [selectedNpc, setSelectedNpc] = useState<NpcDto | null>(null);

  const [form, setForm] = useState({
    name: '',
    role: '',
    npcEmoji: '👤',
    description: '',
    personality: ''
  });

  useEffect(() => {
    fetchNpcs();
  }, []);

  const fetchNpcs = async () => {
    try {
      setLoading(true);
      const data = await getModeratorNpcs();
      setNpcs(data);
    } catch (err) {
      toast.error('Failed to load NPCs');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsCreateMode(true);
    setSelectedNpc(null);
    setForm({
      name: '',
      role: '',
      npcEmoji: '☕',
      description: '',
      personality: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (npc: NpcDto) => {
    setIsCreateMode(false);
    setSelectedNpc(npc);
    setForm({
      name: npc.name,
      role: npc.role,
      npcEmoji: npc.npcEmoji || '👤',
      description: npc.description,
      personality: npc.personality
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('NPC Name is required');
      return;
    }
    if (!form.role.trim()) {
      toast.error('NPC Role is required');
      return;
    }

    try {
      setSubmitting(true);
      if (isCreateMode) {
        await createModeratorNpc(form);
        toast.success('NPC created successfully!');
      } else if (selectedNpc) {
        await updateModeratorNpc(selectedNpc.id, form);
        toast.success('NPC updated successfully!');
      }
      setIsModalOpen(false);
      fetchNpcs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save NPC');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">Quản lý NPC</h1>
          <p className="text-white/40 text-sm">Xem, tạo mới và cấu hình tính cách các NPC cho các bài hội thoại Tiếng Anh.</p>
        </div>
        <button 
          onClick={openCreateModal}
          disabled={loading || submitting}
          className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
        >
          <Plus size={16} /> Tạo NPC mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12 text-white/30 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-brand" />
            Đang tải danh sách NPC...
          </div>
        ) : npcs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/30">Chưa có NPC nào. Hãy bắt đầu tạo một NPC mới!</div>
        ) : (
          npcs.map(npc => (
            <div key={npc.id} className="ur-card rounded-3xl p-5 border border-white/5 bg-navy-2/65 hover:border-purple-brand/35 transition-all group flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-brand/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
              
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner shadow-white/5">
                      {npc.npcEmoji || '👤'}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-white text-base leading-tight">{npc.name}</h3>
                      <p className="text-[10px] text-cyan-brand font-bold uppercase tracking-wider mt-0.5">{npc.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(npc)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    title="Chỉnh sửa NPC"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Context Description */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-white/40 font-semibold text-[10px] uppercase tracking-wider">
                      <BookOpen size={10} /> Ngữ cảnh / Vị trí
                    </div>
                    <p className="text-white/70 italic leading-relaxed bg-black/10 p-2.5 rounded-xl border border-white/[0.02]">
                      "{npc.description || 'Chưa thiết lập ngữ cảnh...'}"
                    </p>
                  </div>

                  {/* Personality Prompts */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-white/40 font-semibold text-[10px] uppercase tracking-wider">
                      <MessageSquare size={10} /> Tính cách & Luật AI
                    </div>
                    <p className="text-white/60 leading-relaxed bg-black/15 p-2.5 rounded-xl border border-white/[0.03] line-clamp-3" title={npc.personality}>
                      {npc.personality || 'Chưa thiết lập prompt tính cách cho AI...'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/35 font-mono">
                <span>NPC ID: #{npc.id}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Create NPC Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="ur-card border border-white/10 max-w-lg w-full p-6 rounded-3xl relative shadow-[0_0_50px_rgba(139,92,246,0.15)] bg-navy-1/95 overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              disabled={submitting}
              type="button"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                {isCreateMode ? (
                  <>
                    <Plus size={20} className="text-purple-brand" /> Tạo NPC mới
                  </>
                ) : (
                  <>
                    <Edit3 size={18} className="text-purple-brand" /> Chỉnh sửa NPC
                  </>
                )}
              </h2>
              <p className="text-white/40 text-xs mt-1">
                {isCreateMode ? 'Thiết lập danh tính và prompt hướng dẫn cho AI của nhân vật mới.' : 'Cập nhật lại prompt và thông tin cho NPC hiện tại.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Emoji Select Block */}
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-semibold text-white/70 block">Emoji</label>
                  <div className="w-full h-24 rounded-2xl bg-navy-2 border border-white/10 flex items-center justify-center text-4xl shadow-inner select-none relative group">
                    {form.npcEmoji}
                  </div>
                </div>

                <div className="col-span-2 space-y-4">
                  {/* Name input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70 block">Tên nhân vật (Name)</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ví dụ: Security Guard Lee"
                      className="bg-navy-2 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-brand outline-none transition-all w-full"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={submitting}
                    />
                  </div>

                  {/* Role input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70 block">Vai trò (Role)</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ví dụ: Security Guard, Hacker"
                      className="bg-navy-2 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-brand outline-none transition-all w-full"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Emoji Picker Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 block">Chọn biểu tượng cảm xúc (Emoji Picker)</label>
                <div className="grid grid-cols-9 gap-1.5 p-2 bg-navy-3 border border-white/10 rounded-2xl max-h-24 overflow-y-auto">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, npcEmoji: emoji })}
                      className={`text-xl p-1 rounded-lg transition-all hover:bg-white/10 ${form.npcEmoji === emoji ? 'bg-purple-brand/20 border border-purple-brand/40 ring-1 ring-purple-brand/50 scale-110' : 'opacity-60'}`}
                      disabled={submitting}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 block">Mô tả vị trí/Ngữ cảnh (Description)</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Mô tả nơi người học gặp NPC. Ví dụ: A security guard blocking the entrance to the corporate archives in Neo-Seoul."
                  className="bg-navy-2 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-brand outline-none transition-all w-full resize-none leading-relaxed"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Personality Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70 block">Tính cách & Prompt hệ thống cho AI (Personality & Rules)</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Cung cấp prompt cấu hình cho AI. Ví dụ: You are strict, easily annoyed. Speak with formal military terminology. Strictly refuse entry unless user provides proper clearance..."
                  className="bg-navy-2 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-brand outline-none transition-all w-full resize-none leading-relaxed font-mono"
                  value={form.personality}
                  onChange={(e) => setForm({ ...form, personality: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
                  disabled={submitting}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-purple-brand text-white hover:bg-purple-light text-sm font-semibold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    'Lưu NPC'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNpcs;
