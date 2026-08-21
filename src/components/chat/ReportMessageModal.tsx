import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Flag, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ReportMessageModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, reportingMessageId, reportMessage } = useChat();
  const [selectedReason, setSelectedReason] = useState<string>('spam');
  const [details, setDetails] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isReportModalOpen || !reportingMessageId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportMessage(reportingMessageId, selectedReason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsReportModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#130b04] border border-orange-500/40 rounded-2xl p-5 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-orange-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Flag className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Report Chat Message</h3>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
            <p className="text-sm font-bold text-white">Report Submitted</p>
            <p className="text-xs text-gray-400">CHRISFIXBET moderation will review this message immediately.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-gray-300 font-medium">Why are you reporting this message?</label>
              <div className="space-y-2 pt-1">
                {[
                  { id: 'scam', label: 'Match-fixing scam or WhatsApp spam' },
                  { id: 'offensive', label: 'Abusive language, slurs or harassment' },
                  { id: 'spam', label: 'Repetitive spam / bot flood' },
                  { id: 'other', label: 'Other violation' },
                ].map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === reason.id
                        ? 'bg-orange-500/20 border-orange-500 text-orange-200'
                        : 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={() => setSelectedReason(reason.id)}
                      className="text-orange-500 focus:ring-0"
                    />
                    <span className="text-xs">{reason.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-medium">Additional Context (Optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide details if needed..."
                rows={2}
                className="w-full bg-black/60 border border-gray-800 rounded-xl p-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 font-bold hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
