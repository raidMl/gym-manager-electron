import React, { useRef } from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { Sale, AppSettings } from '../types';

interface ReceiptModalProps {
  sale: Sale | null;
  settings: AppSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, settings, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!sale) return null;

  const handlePrint = () => {
    // If running in Electron, use electronAPI.printReceipt if available, else window.print()
    if (typeof window !== 'undefined' && (window as unknown as { electronAPI?: { printReceipt: (opt: unknown) => void } }).electronAPI) {
      (window as unknown as { electronAPI: { printReceipt: (opt: unknown) => void } }).electronAPI.printReceipt({ silent: false });
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60 no-print">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Receipt #{sale.receiptNumber}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="overflow-y-auto p-6 flex justify-center bg-neutral-950/40">
          <div
            ref={receiptRef}
            className="thermal-receipt bg-white text-black p-5 rounded-lg shadow-md w-full text-xs font-mono select-none"
            style={{ width: '80mm', minHeight: '120mm' }}
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
              <h2 className="text-base font-bold uppercase tracking-wider">{settings.gymName}</h2>
              <p className="text-[11px] text-gray-700">{settings.address}</p>
              <p className="text-[11px] text-gray-700">Tel: {settings.phone}</p>
              <div className="mt-2 text-[10px] text-gray-500">
                <span>{new Date(sale.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-[10px] font-semibold text-gray-800">
                Receipt: {sale.receiptNumber} | Cashier: {sale.cashierName}
              </div>
              {sale.memberName && (
                <div className="text-[11px] font-bold text-gray-900 mt-1">
                  Customer: {sale.memberName}
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
              <div className="flex justify-between font-bold border-b border-gray-200 pb-1 mb-1 text-[11px]">
                <span>ITEM</span>
                <span>QTY x PRICE</span>
                <span>TOTAL</span>
              </div>
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 text-[11px]">
                  <span className="truncate max-w-[120px]">{item.productName}</span>
                  <span className="text-gray-600">
                    {item.quantity} x {settings.currency}{item.unitPrice.toFixed(2)}
                  </span>
                  <span className="font-semibold text-right">
                    {settings.currency}{item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-right text-[11px] border-b border-dashed border-gray-400 pb-3 mb-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>{settings.currency}{sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Discount:</span>
                  <span>-{settings.currency}{sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-black pt-1 border-t border-gray-300">
                <span>TOTAL:</span>
                <span>{settings.currency}{sale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-600 pt-1">
                <span>Payment Mode:</span>
                <span className="uppercase font-semibold">{sale.paymentMethod}</span>
              </div>
              {sale.cashReceived !== undefined && sale.cashReceived > 0 && (
                <>
                  <div className="flex justify-between text-[11px] text-gray-600">
                    <span>Cash Received:</span>
                    <span>{settings.currency}{sale.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-800">
                    <span>Change Returned:</span>
                    <span>{settings.currency}{(sale.changeGiven || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-gray-600 space-y-1">
              <p>{settings.receiptFooter}</p>
              <p className="font-mono text-[9px] pt-1">*** 100% OFFLINE LOCAL POS ***</p>
              {/* Fake barcode bars */}
              <div className="flex justify-center items-center gap-[2px] h-8 mt-2 opacity-80">
                {Array.from({ length: 38 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-black h-full"
                    style={{
                      width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px',
                      opacity: i % 5 === 0 ? 0 : 1
                    }}
                  />
                ))}
              </div>
              <p className="text-[9px] tracking-widest">{sale.receiptNumber}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-end gap-3 bg-neutral-900/80 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt (80mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
