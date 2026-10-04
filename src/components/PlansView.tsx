import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Check,
  Edit,
  Trash2,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { SubscriptionPlan, Member, AppSettings } from '../types';
import { getTranslation } from '../utils/translations';

interface PlansViewProps {
  plans: SubscriptionPlan[];
  members: Member[];
  settings: AppSettings;
  onSavePlan: (plan: SubscriptionPlan) => void;
  onDeletePlan: (id: string) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({
  plans,
  members,
  settings,
  onSavePlan,
  onDeletePlan
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    durationDays: 30,
    price: 40,
    category: 'standard' as SubscriptionPlan['category'],
    description: '',
    featuresText: ''
  });

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      durationDays: 30,
      price: 40,
      category: 'standard',
      description: 'Full access to weight room & cardio area',
      featuresText: 'Weight room\nCardio machines\nLocker access\nShower & Sauna'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      durationDays: plan.durationDays,
      price: plan.price,
      category: plan.category,
      description: plan.description,
      featuresText: plan.features.join('\n')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.price) return;

    const features = planForm.featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const badgeColor =
      planForm.category === 'vip'
        ? 'bg-amber-500 text-neutral-950 font-bold'
        : planForm.category === 'student'
        ? 'bg-indigo-600 text-white'
        : 'bg-emerald-600 text-white';

    onSavePlan({
      id: editingPlan ? editingPlan.id : 'plan-' + Date.now(),
      name: planForm.name,
      durationDays: Number(planForm.durationDays) || 30,
      price: Number(planForm.price),
      category: planForm.category,
      description: planForm.description,
      features: features.length > 0 ? features : ['Gym Access'],
      badgeColor
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">{t('plans')}</h1>
            <p className="text-xs text-neutral-400">Gym Membership Tiers, Passes &amp; Pricing</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addPlan')}</span>
        </button>
      </div>

      {/* Plans Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map(p => {
          const enrolledCount = members.filter(m => m.planId === p.id && m.status === 'active').length;

          return (
            <div
              key={p.id}
              className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between hover:border-neutral-700 transition shadow-lg relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full ${p.badgeColor}`}>
                    {p.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1 text-neutral-400 hover:text-white rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {plans.length > 1 && (
                      <button
                        onClick={() => onDeletePlan(p.id)}
                        className="p-1 text-neutral-500 hover:text-red-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-black text-white tracking-tight">{p.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 min-h-[36px]">{p.description}</p>

                {/* Price Display */}
                <div className="my-5 pb-4 border-b border-neutral-800 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">
                    {settings.currency}{p.price}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    / {p.durationDays} days
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-2 text-xs text-neutral-300">
                  {p.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Enrolled active members count */}
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{enrolledCount} active members</span>
                </span>
                <span className="text-[11px] text-neutral-500">{p.durationDays}d period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">
              {editingPlan ? 'Edit Membership Plan' : t('addPlan')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">{t('planName')} *</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. 3 Months Power"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">{t('durationDays')} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={planForm.durationDays}
                    onChange={e => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">{t('price')} ({settings.currency}) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={planForm.price}
                    onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Category</label>
                <select
                  value={planForm.category}
                  onChange={e => setPlanForm({ ...planForm, category: e.target.value as SubscriptionPlan['category'] })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP All-Inclusive</option>
                  <option value="student">Student</option>
                  <option value="daypass">Day Pass</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Short Description</label>
                <input
                  type="text"
                  value={planForm.description}
                  onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Overview of this plan..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Inclusions / Features (One per line)</label>
                <textarea
                  rows={3}
                  value={planForm.featuresText}
                  onChange={e => setPlanForm({ ...planForm, featuresText: e.target.value })}
                  placeholder="Full gym access&#10;Sauna&#10;Locker room"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-neutral-400 hover:bg-neutral-800 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
