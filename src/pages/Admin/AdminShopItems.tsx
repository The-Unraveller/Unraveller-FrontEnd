import * as React from 'react';
import { useState, useEffect } from 'react';
import { Store, Plus, Edit3, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getAdminShopItems,
  createAdminShopItem,
  updateAdminShopItem,
  deleteAdminShopItem,
  type AdminShopItemDto,
} from '../../services/api';
import { useGameStore } from '../../store/useGameStore';
import Seo from '../../components/seo/Seo';

const ITEM_TYPES = [
  { value: 'InGameHint', label: 'In-Game Hint', emoji: '💡' },
  { value: 'BribeNpc', label: 'Bribe NPC', emoji: '🤝' },
  { value: 'Cosmetic', label: 'Cosmetic', emoji: '✨' },
];

const AdminShopItems: React.FC = () => {
  const { user } = useGameStore();
  const [items, setItems] = useState<AdminShopItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminShopItemDto | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'InGameHint',
    priceXp: 100,
    discountPriceXp: 0,
    emoji: '📦',
  });

  const fetchItems = async () => {
    try {
      const data = await getAdminShopItems();
      setItems(data);
    } catch (err) {
      toast.error('Failed to load shop items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ name: '', description: '', type: 'InGameHint', priceXp: 100, discountPriceXp: 0, emoji: '📦' });
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminShopItemDto) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      type: item.type,
      priceXp: item.priceXp,
      discountPriceXp: item.discountPriceXp,
      emoji: item.emoji,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await updateAdminShopItem(editingItem.id, form);
        toast.success('Shop item updated');
      } else {
        await createAdminShopItem(form);
        toast.success('Shop item created');
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save shop item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this shop item?')) return;
    try {
      await deleteAdminShopItem(id);
      toast.success('Shop item deleted');
      fetchItems();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete shop item');
    }
  };

  const getTypeLabel = (type: string) => {
    return ITEM_TYPES.find(t => t.value === type)?.label ?? type;
  };

  const getTypeEmoji = (type: string) => {
    return ITEM_TYPES.find(t => t.value === type)?.emoji ?? '📦';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Seo title="Quan Ly Shop" description="Quan ly vat pham trong shop cua game." keywords="admin, shop, vat pham" canonical="/admin/shop-items" noIndex />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">🛒 Quản lý Shop Items</h1>
          <p className="text-white/40 text-sm">Thêm, sửa, xóa vật phẩm trong cửa hàng.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={16} /> Thêm vật phẩm
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-white/30 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-brand" /> Loading shop items...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-white/30">Chưa có vật phẩm nào trong shop.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="ur-card rounded-2xl p-5 border border-white/5 hover:border-purple-brand/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{item.emoji || getTypeEmoji(item.type)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-white/30 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-white text-lg leading-tight">{item.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-brand/10 text-purple-light border border-purple-brand/20">
                  {getTypeLabel(item.type)}
                </span>
                <p className="text-white/40 text-xs mt-2 line-clamp-2">{item.description || 'No description'}</p>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs font-mono">
                <span className="text-xp-orange font-bold">{item.priceXp} XP</span>
                {item.discountPriceXp > 0 && (
                  <span className="text-gold font-bold">{item.discountPriceXp} XP (VIP)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-2 border border-purple-brand/30 rounded-3xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold text-white">
                {editingItem ? '✏️ Chỉnh sửa vật phẩm' : '➕ Thêm vật phẩm mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="p-2 text-white/40 hover:text-white transition-colors disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium">Tên vật phẩm</label>
                <input
                  type="text"
                  required
                  disabled={saving}
                  className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium">Mô tả</label>
                <textarea
                  rows={2}
                  disabled={saving}
                  className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand resize-none disabled:opacity-50"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium">Loại vật phẩm</label>
                <select
                  disabled={saving}
                  className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  {ITEM_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium">Giá (XP)</label>
                <input
                  type="number"
                  min="0"
                  required
                  disabled={saving}
                  className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50 font-mono"
                  value={form.priceXp}
                  onChange={e => setForm({ ...form, priceXp: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium">Giá VIP (XP) — 0 nếu không có</label>
                <input
                  type="number"
                  min="0"
                  disabled={saving}
                  className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50 font-mono"
                  value={form.discountPriceXp}
                  onChange={e => setForm({ ...form, discountPriceXp: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-white/40 font-medium">Emoji</label>
                <input
                  type="text"
                  disabled={saving}
                  className="w-full bg-navy-3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-brand disabled:opacity-50"
                  value={form.emoji}
                  onChange={e => setForm({ ...form, emoji: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
                  disabled={saving}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-purple-brand text-white hover:bg-purple-light text-sm font-semibold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
                >
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Đang lưu...</> : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShopItems;
