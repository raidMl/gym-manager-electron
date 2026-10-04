import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Barcode,
  Search,
  CheckCircle,
  CreditCard,
  DollarSign,
  PackagePlus,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { Product, Sale, SaleItem, Member, AppSettings } from '../types';
import { getTranslation } from '../utils/translations';
import { sound } from '../utils/audio';

interface POSViewProps {
  products: Product[];
  members: Member[];
  settings: AppSettings;
  onSaveProduct: (product: Partial<Product> & { name: string; salePrice: number; barcode: string }) => void;
  onCompleteSale: (saleData: Omit<Sale, 'id' | 'receiptNumber' | 'timestamp'>) => Sale;
  onShowReceipt: (sale: Sale) => void;
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  members,
  settings,
  onSaveProduct,
  onCompleteSale,
  onShowReceipt
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'debt'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(0);

  // New product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'drinks' as Product['category'],
    barcode: '',
    costPrice: 0,
    salePrice: 0,
    stock: 20,
    minStockAlert: 5,
    unit: 'Piece'
  });

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    return matchCat && matchSearch;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      sound.playAccessDenied();
      return;
    }

    sound.playBarcodeBeep();
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.salePrice,
            total: product.salePrice
          }
        ];
      }
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.productId === productId) {
            const prod = products.find(p => p.id === productId);
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (prod && newQty > prod.stock) return item;
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Barcode scanner auto-detect
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(
      p => p.barcode.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (found) {
      addToCart(found);
      setBarcodeInput('');
    } else {
      sound.playAccessDenied();
    }
  };

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(0, subtotal - discount);
  const changeToReturn = Math.max(0, (cashReceived || 0) - total);

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashReceived(Math.ceil(total));
    setIsCheckoutOpen(true);
  };

  const handleFinishSale = () => {
    const selectedMember = members.find(m => m.id === selectedMemberId);

    const sale = onCompleteSale({
      items: cart,
      subtotal,
      discount,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? cashReceived : total,
      changeGiven: paymentMethod === 'cash' ? changeToReturn : 0,
      cashierName: 'Front Desk',
      memberId: selectedMember?.id,
      memberName: selectedMember?.name
    });

    sound.playCashRegister();
    setIsCheckoutOpen(false);
    setCart([]);
    setDiscount(0);
    setSelectedMemberId('');

    // Open receipt modal automatically
    onShowReceipt(sale);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.salePrice) return;

    onSaveProduct({
      name: newProductForm.name,
      category: newProductForm.category,
      barcode: newProductForm.barcode || '789' + Math.floor(1000 + Math.random() * 9000),
      costPrice: Number(newProductForm.costPrice) || 0,
      salePrice: Number(newProductForm.salePrice),
      stock: Number(newProductForm.stock) || 10,
      minStockAlert: Number(newProductForm.minStockAlert) || 5,
      unit: newProductForm.unit || 'Piece'
    });

    setIsProductModalOpen(false);
    setNewProductForm({
      name: '',
      category: 'drinks',
      barcode: '',
      costPrice: 0,
      salePrice: 0,
      stock: 20,
      minStockAlert: 5,
      unit: 'Piece'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Barcode scanner gun input */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">{t('posCatalog')}</h1>
            <p className="text-xs text-neutral-400">Drinks, Proteins, Supplements &amp; Merch</p>
          </div>
        </div>

        {/* Barcode scanner gun direct entry */}
        <form onSubmit={handleBarcodeScan} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              placeholder="Scan product barcode..."
              className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-emerald-400 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
            />
            <Barcode className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
          >
            <PackagePlus className="w-4 h-4 text-blue-400" />
            <span>{t('addProduct')}</span>
          </button>
        </form>
      </div>

      {/* Main Grid: Products on Left, Cart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Products Column (7 or 8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'drinks', label: 'Drinks & Water' },
              { id: 'supplements', label: 'Proteins & BCAAs' },
              { id: 'snacks', label: 'Bars & Snacks' },
              { id: 'gear', label: 'Towels & Gear' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredProducts.map(p => {
              const isLowStock = p.stock <= p.minStockAlert && p.stock > 0;
              const isOut = p.stock <= 0;

              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`bg-neutral-900/90 border rounded-2xl p-4 flex flex-col justify-between transition cursor-pointer group shadow-sm select-none ${
                    isOut
                      ? 'opacity-40 border-neutral-800 pointer-events-none'
                      : 'border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono mb-2">
                      <span className="uppercase">{p.category}</span>
                      <span className="bg-neutral-950 px-1 rounded border border-neutral-800">{p.barcode}</span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-blue-300 transition line-clamp-2 leading-tight">
                      {p.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        {settings.currency}{p.salePrice.toFixed(2)}
                      </div>
                      <div className={`text-[10px] font-mono ${isLowStock ? 'text-amber-400 font-bold' : isOut ? 'text-red-400' : 'text-neutral-500'}`}>
                        {isOut ? 'Out of stock' : `${p.stock} in stock`}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart & Checkout Panel (4 cols) */}
        <div className="lg:col-span-4 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between min-h-[520px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">{t('cart')}</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] text-neutral-400 hover:text-red-400 transition"
                >
                  {t('clearCart')}
                </button>
              )}
            </div>

            {/* Optional Customer Selection */}
            <div className="mb-3">
              <label className="block text-[11px] text-neutral-400 mb-1">
                Link to Member (Optional)
              </label>
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Walk-in Guest / Anonymous</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.barcode}) {m.balance < 0 ? `[Debt: ${settings.currency}${Math.abs(m.balance)}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Line Items List */}
            {cart.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 text-xs flex flex-col items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-neutral-700 mb-2" />
                <span>{t('cartEmpty')}</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div
                    key={item.productId}
                    className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[130px]">
                      <div className="font-semibold text-neutral-200 truncate">{item.productName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {settings.currency}{item.unitPrice.toFixed(2)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.productId, -1)}
                          className="p-1 hover:text-white text-neutral-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold px-2 text-white text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, 1)}
                          className="p-1 hover:text-white text-neutral-400"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-white w-14 text-right">
                        {settings.currency}{item.total.toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-neutral-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Bottom Summary & Checkout Button */}
          <div className="border-t border-neutral-800 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>{t('subtotal')}</span>
              <span className="font-mono font-bold text-white">
                {settings.currency}{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-neutral-400">
              <span>{t('discount')}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs">{settings.currency}</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount || ''}
                  onChange={e => setDiscount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-0.5 text-right font-mono text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-between text-base font-black text-white pt-1 border-t border-neutral-800">
              <span>{t('total')}</span>
              <span className="text-emerald-400 font-mono">
                {settings.currency}{total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg ${
                cart.length > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('completeSale')} ({settings.currency}{total.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout & Payment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Payment &amp; Finalize Sale</span>
              </h2>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            {/* Total Amount to Charge */}
            <div className="text-center py-3 bg-neutral-950 rounded-2xl border border-neutral-800">
              <span className="text-xs text-neutral-400">Total to Charge</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                {settings.currency}{total.toFixed(2)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash' as const, label: t('cash') },
                { id: 'card' as const, label: t('card') },
                { id: 'debt' as const, label: t('debt') }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    paymentMethod === m.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Cash Calculator (if cash selected) */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">{t('cashReceived')}</label>
                  <input
                    type="number"
                    value={cashReceived || ''}
                    onChange={e => setCashReceived(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-base font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick Cash preset denominations */}
                <div className="flex gap-2">
                  {[10, 20, 50, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCashReceived(val)}
                      className="flex-1 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 rounded-lg text-neutral-200 font-mono text-xs font-semibold"
                    >
                      {settings.currency}{val}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                  <span className="text-neutral-400">{t('changeToReturn')}:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {settings.currency}{changeToReturn.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'debt' && !selectedMemberId && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Please link a member first to record this unpaid balance as a debt.</span>
              </div>
            )}

            <button
              onClick={handleFinishSale}
              disabled={paymentMethod === 'debt' && !selectedMemberId}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Sale &amp; Print Receipt (80mm)</span>
            </button>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-blue-400" />
                <span>{t('addProduct')}</span>
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">{t('productName')} *</label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="e.g. Whey Protein 1kg"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">{t('category')}</label>
                  <select
                    value={newProductForm.category}
                    onChange={e => setNewProductForm({ ...newProductForm, category: e.target.value as Product['category'] })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-blue-500 capitalize"
                  >
                    <option value="drinks">Drinks</option>
                    <option value="supplements">Supplements</option>
                    <option value="snacks">Snacks</option>
                    <option value="gear">Gear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    value={newProductForm.barcode}
                    onChange={e => setNewProductForm({ ...newProductForm, barcode: e.target.value })}
                    placeholder="789xxxx"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">{t('salePrice')} *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newProductForm.salePrice || ''}
                    onChange={e => setNewProductForm({ ...newProductForm, salePrice: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">{t('costPrice')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProductForm.costPrice || ''}
                    onChange={e => setNewProductForm({ ...newProductForm, costPrice: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">{t('stockQuantity')}</label>
                  <input
                    type="number"
                    value={newProductForm.stock}
                    onChange={e => setNewProductForm({ ...newProductForm, stock: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newProductForm.unit}
                    onChange={e => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                    placeholder="Piece / Tub / Can"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:bg-neutral-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-500/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
