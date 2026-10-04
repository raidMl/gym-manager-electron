import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCw,
  Trash2,
  Edit,
  Download,
  Printer,
  Sparkles,
  KeyRound,
  IdCard,
  Plus
} from 'lucide-react';
import { Member, SubscriptionPlan, AppSettings, Gender } from '../types';
import { getTranslation } from '../utils/translations';
import { sound } from '../utils/audio';

interface MembersViewProps {
  members: Member[];
  plans: SubscriptionPlan[];
  settings: AppSettings;
  onSaveMember: (member: Partial<Member> & { name: string; planId: string; barcode: string }) => void;
  onDeleteMember: (id: string) => void;
  onRenewMember: (memberId: string, planId: string, paymentMethod?: 'cash' | 'card') => void;
  initialOpenAdd?: boolean;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  plans,
  settings,
  onSaveMember,
  onDeleteMember,
  onRenewMember,
  initialOpenAdd = false
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'debt'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAdd);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [renewPlanId, setRenewPlanId] = useState<string>(plans[1]?.id || plans[0]?.id || '');
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<'cash' | 'card'>('cash');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as Gender,
    phone: '',
    email: '',
    nationalId: '',
    emergencyContact: '',
    barcode: '',
    planId: plans[1]?.id || plans[0]?.id || '',
    startDate: new Date().toISOString().slice(0, 10),
    balance: 0,
    photoUrl: '',
    lockerNumber: undefined as number | undefined,
    notes: ''
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const future7Days = new Date();
  future7Days.setDate(future7Days.getDate() + 7);
  const future7Str = future7Days.toISOString().slice(0, 10);

  // Filter members
  const filteredMembers = members.filter(m => {
    // Search query
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.barcode.toLowerCase().includes(search.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;

    if (statusFilter === 'active') return m.status === 'active';
    if (statusFilter === 'expired') return m.status === 'expired' || m.endDate < todayStr;
    if (statusFilter === 'expiring') return m.endDate >= todayStr && m.endDate <= future7Str;
    if (statusFilter === 'debt') return m.balance < 0;

    return true;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      gender: 'male',
      phone: '',
      email: '',
      nationalId: '',
      emergencyContact: '',
      barcode: 'RFID-' + Math.floor(1000 + Math.random() * 9000),
      planId: plans[1]?.id || plans[0]?.id || '',
      startDate: new Date().toISOString().slice(0, 10),
      balance: 0,
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      lockerNumber: undefined,
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      gender: m.gender,
      phone: m.phone,
      email: m.email || '',
      nationalId: m.nationalId || '',
      emergencyContact: m.emergencyContact || '',
      barcode: m.barcode,
      planId: m.planId,
      startDate: m.startDate,
      balance: m.balance,
      photoUrl: m.photoUrl,
      lockerNumber: m.lockerNumber,
      notes: m.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.planId) return;

    onSaveMember({
      ...(editingMember ? { id: editingMember.id } : {}),
      name: formData.name,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      nationalId: formData.nationalId,
      emergencyContact: formData.emergencyContact,
      barcode: formData.barcode || 'RFID-' + Math.floor(1000 + Math.random() * 9000),
      planId: formData.planId,
      startDate: formData.startDate,
      balance: Number(formData.balance) || 0,
      photoUrl: formData.photoUrl,
      lockerNumber: formData.lockerNumber,
      notes: formData.notes
    });

    sound.playBarcodeBeep();
    setIsAddModalOpen(false);
  };

  const handleRenew = (memberId: string) => {
    onRenewMember(memberId, renewPlanId, renewPaymentMethod);
    sound.playCashRegister();
    if (selectedMember && selectedMember.id === memberId) {
      // Refresh selected member reference
      const updated = members.find(m => m.id === memberId);
      if (updated) setSelectedMember(updated);
    }
  };

  const handleGenerateBarcode = () => {
    setFormData(prev => ({
      ...prev,
      barcode: 'RFID-' + Math.floor(1000 + Math.random() * 9000)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter & Action Header */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          {(['all', 'active', 'expiring', 'expired', 'debt'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === tab
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {tab === 'all' && t('all')}
              {tab === 'active' && t('active')}
              {tab === 'expiring' && t('expiringSoon')}
              {tab === 'expired' && t('expired')}
              {tab === 'debt' && t('hasDebt')}
            </button>
          ))}
        </div>

        {/* Right Search Input & New Member Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, RFID..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3 pointer-events-none" />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('quickAddMember')}</span>
          </button>
        </div>
      </div>

      {/* Members Data Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-neutral-950 text-neutral-400 font-mono text-[10px] uppercase border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">RFID / Tag</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Validity Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredMembers.map(m => {
                const isActive = m.status === 'active';
                const isExpiring = m.endDate >= todayStr && m.endDate <= future7Str;
                const isExpired = m.endDate < todayStr || m.status === 'expired';

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-neutral-800/40 transition group cursor-pointer"
                    onClick={() => setSelectedMember(m)}
                  >
                    {/* Photo & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.photoUrl}
                          alt={m.name}
                          className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-emerald-400 transition flex items-center gap-1.5">
                            <span>{m.name}</span>
                            {m.lockerNumber && (
                              <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-mono">
                                #{m.lockerNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                            <span>{m.phone}</span>
                            {m.email && <span>&bull; {m.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Barcode / RFID Tag */}
                    <td className="py-3 px-4 font-mono text-neutral-300">
                      <span className="bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                        {m.barcode}
                      </span>
                    </td>

                    {/* Plan */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-200">{m.planName}</span>
                    </td>

                    {/* Validity Period */}
                    <td className="py-3 px-4 text-neutral-400">
                      <div>
                        <span>Until: </span>
                        <span className={`font-mono font-bold ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {m.endDate}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        Started: {m.startDate}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isExpired
                            ? 'bg-red-500/20 text-red-400'
                            : isExpiring
                            ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {isExpired ? 'EXPIRED' : isExpiring ? 'EXPIRING' : 'ACTIVE'}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-4 font-mono font-semibold">
                      {m.balance < 0 ? (
                        <span className="text-red-400">
                          -{settings.currency}{Math.abs(m.balance)}
                        </span>
                      ) : (
                        <span className="text-neutral-400">Paid ($0)</span>
                      )}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-3 px-4 text-right rtl:text-left" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setRenewPlanId(m.planId);
                          }}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
                          title="Renew Subscription"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t('deleteConfirm'))) {
                              onDeleteMember(m.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredMembers.length === 0 && (
            <div className="py-12 text-center text-neutral-500 text-xs">
              No members found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Member Details & Renewal Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMember.name}</h2>
                  <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      {selectedMember.barcode}
                    </span>
                    <span className="capitalize">&bull; {selectedMember.gender}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                &times;
              </button>
            </div>

            {/* Subscription & Expiry details */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Current Plan:</span>
                <span className="font-bold text-white">{selectedMember.planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Validity Period:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {selectedMember.startDate} &rarr; {selectedMember.endDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Phone:</span>
                <span className="font-mono text-neutral-200">{selectedMember.phone}</span>
              </div>
              {selectedMember.emergencyContact && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Emergency Phone:</span>
                  <span className="font-mono text-neutral-300">{selectedMember.emergencyContact}</span>
                </div>
              )}
              {selectedMember.balance !== 0 && (
                <div className="flex justify-between items-center font-bold">
                  <span className="text-neutral-400">Outstanding Debt:</span>
                  <span className="text-red-400 font-mono">
                    {settings.currency}{Math.abs(selectedMember.balance)}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Renewal Section */}
            <div className="space-y-3 border-t border-neutral-800 pt-4">
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                {t('renewSubscription')}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {plans.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setRenewPlanId(p.id)}
                    className={`p-2.5 rounded-xl border text-left rtl:text-right transition text-xs ${
                      renewPlanId === p.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-neutral-200">{p.name}</div>
                    <div className="text-emerald-400 font-mono text-[11px]">
                      {settings.currency}{p.price} ({p.durationDays}d)
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setRenewPaymentMethod('cash')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                    renewPaymentMethod === 'cash'
                      ? 'bg-neutral-800 border-emerald-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  Pay with Cash
                </button>
                <button
                  onClick={() => setRenewPaymentMethod('card')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                    renewPaymentMethod === 'card'
                      ? 'bg-neutral-800 border-emerald-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  Pay with Card
                </button>
              </div>

              <button
                onClick={() => handleRenew(selectedMember.id)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Confirm Renewal &amp; Register Income</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>{editingMember ? t('editMemberTitle') : t('addMemberTitle')}</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('gender')}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* RFID / Barcode */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('barcodeOrRfid')} *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.barcode}
                      onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="e.g. RFID-1049"
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition border border-neutral-700"
                    >
                      {t('generateBarcode')}
                    </button>
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('selectPlan')} *
                  </label>
                  <select
                    value={formData.planId}
                    onChange={e => setFormData({ ...formData, planId: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {settings.currency}{p.price} ({p.durationDays} Days)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('startDate')}
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t('emergencyContact')}
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Relative phone number"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  {t('notes')} / Medical Goals
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Goals, health cautions, notes..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:bg-neutral-800 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
