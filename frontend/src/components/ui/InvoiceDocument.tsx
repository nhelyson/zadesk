'use client';

import React from 'react';
import { Logo } from '@/components/ui/Logo';
import { Printer, Download, CheckCircle2, ShieldCheck, ArrowLeft, Copy, Check } from 'lucide-react';

export interface InvoiceItem {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  unitPriceXaf: number;
  totalXaf: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  transactionReference?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  emitter: {
    name: string;
    legalForm: string;
    address: string;
    city: string;
    country: string;
    rccm?: string;
    nif?: string;
    supportEmail: string;
  };
  client: {
    workspaceName: string;
    contactName: string;
    email: string;
    address?: string;
    city?: string;
    country?: string;
  };
  items: InvoiceItem[];
  subtotalXaf: number;
  taxRatePercent?: number;
  taxAmountXaf?: number;
  discountXaf?: number;
  totalXaf: number;
  currency: string;
}

export interface InvoiceDocumentProps {
  invoice: InvoiceData;
  onBack?: () => void;
  className?: string;
}

/**
 * Zadesk Professional Invoice Document Component
 * Print-ready, accessible, complies with SaaS billing standards
 */
export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  onBack,
  className = '',
}) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    if (invoice.transactionReference) {
      navigator.clipboard.writeText(invoice.transactionReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPaid = invoice.status === 'PAID';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Facture {invoice.invoiceNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {isPaid ? 'Payée' : 'En attente'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger en PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <div
        id="invoice-printable-sheet"
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8 text-slate-800 print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <Logo size="sm" showText={false} />
              </div>
              <span className="text-xl font-black text-slate-900 font-sans tracking-tight">
                {invoice.emitter.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              {invoice.emitter.legalForm} • {invoice.emitter.address}, {invoice.emitter.city}, {invoice.emitter.country}
              {invoice.emitter.rccm && ` • RCCM: ${invoice.emitter.rccm}`}
              {invoice.emitter.nif && ` • NIF: ${invoice.emitter.nif}`}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold block">
              FACTURE OFFICIELLE
            </span>
            <div className="text-2xl font-black text-slate-900 font-sans">
              {invoice.invoiceNumber}
            </div>
            <div className="text-xs text-slate-500 space-y-0.5 pt-1">
              <p>Émise le : <strong className="text-slate-800">{invoice.issueDate}</strong></p>
              <p>Échéance : <strong className="text-slate-800">{invoice.dueDate}</strong></p>
            </div>
          </div>
        </div>

        {/* Emitter & Client Metadata Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Destinataire (Client)
            </span>
            <div className="text-sm font-bold text-slate-900">
              {invoice.client.workspaceName}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              À l&apos;attention de : <strong>{invoice.client.contactName}</strong><br />
              Email : {invoice.client.email}<br />
              {invoice.client.address && `${invoice.client.address}, `}
              {invoice.client.city && `${invoice.client.city}, `}
              {invoice.client.country || 'Congo'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Règlement & Transaction
            </span>
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span>{invoice.paymentMethod || 'Paiement en ligne sécurisé'}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xs text-slate-600 space-y-0.5">
              {invoice.paidAt && (
                <p>Date de règlement : <strong>{invoice.paidAt}</strong></p>
              )}
              {invoice.transactionReference && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span>Réf. SasPay : <code className="font-mono text-[11px] text-slate-800">{invoice.transactionReference}</code></span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors print:hidden"
                    title="Copier la référence"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-2">Désignation</th>
                <th className="py-3 px-2 text-center">Quantité</th>
                <th className="py-3 px-2 text-right">Prix Unitaire</th>
                <th className="py-3 px-2 text-right">Montant HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-2">
                    <span className="font-bold text-slate-900 block text-xs">
                      {item.description}
                    </span>
                    {item.details && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {item.details}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-center font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono">
                    {item.unitPriceXaf.toLocaleString('fr-FR')} {invoice.currency}
                  </td>
                  <td className="py-3.5 px-2 text-right font-semibold text-slate-900 font-mono">
                    {item.totalXaf.toLocaleString('fr-FR')} {invoice.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Calculations Breakdown */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pt-4 border-t border-slate-200">
          <div className="max-w-xs text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-600">Conditions de règlement :</p>
            <p>Paiement comptant à réception de facture via la passerelle agréée SasPay (Airtel Money, MTN MoMo, Carte bancaire).</p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total HT :</span>
              <span className="font-mono font-medium text-slate-800">
                {invoice.subtotalXaf.toLocaleString('fr-FR')} {invoice.currency}
              </span>
            </div>

            {invoice.discountXaf !== undefined && invoice.discountXaf > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Remise appliquée :</span>
                <span className="font-mono font-medium">
                  -{invoice.discountXaf.toLocaleString('fr-FR')} {invoice.currency}
                </span>
              </div>
            )}

            {invoice.taxAmountXaf !== undefined && (
              <div className="flex justify-between text-slate-600">
                <span>TVA ({invoice.taxRatePercent || 0}%) :</span>
                <span className="font-mono font-medium text-slate-800">
                  {invoice.taxAmountXaf.toLocaleString('fr-FR')} {invoice.currency}
                </span>
              </div>
            )}

            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline text-sm">
              <span className="font-bold text-slate-900">Total TTC :</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {invoice.totalXaf.toLocaleString('fr-FR')} {invoice.currency}
              </span>
            </div>

            {isPaid && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Facture acquittée en totalité
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Legal Mentions */}
        <div className="pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
          <p>{invoice.emitter.name} — Société par actions simplifiée au capital de 1 000 000 FCFA</p>
          <p>Pour toute question comptable, contactez notre service facturation : {invoice.emitter.supportEmail}</p>
        </div>
      </div>
    </div>
  );
};
