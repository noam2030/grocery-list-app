import React, { useState } from 'react';
import { AlertTriangle, Server, Settings, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api/client';

interface DiagnosticBannerProps {
  isHtmlError: boolean;
  errorMessage: string | null;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}

export const DiagnosticBanner: React.FC<DiagnosticBannerProps> = ({
  isHtmlError,
  errorMessage,
  isDemoMode,
  onToggleDemoMode,
  onRetry,
  onDismiss
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(() => api.getApiBaseUrl() || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const clean = customUrl.trim().replace(/\/+$/, '');
    const res = await api.checkHealth(clean);
    setTesting(false);
    setTestResult({ ok: res.ok, message: res.message });

    if (res.ok) {
      api.setApiBaseUrl(clean);
      setTimeout(() => {
        onRetry();
      }, 600);
    }
  };

  const handleClearUrl = () => {
    api.setApiBaseUrl(null);
    setCustomUrl('');
    setTestResult({ ok: true, message: 'Cleared custom URL. Falling back to default.' });
  };

  return (
    <div
      role="alert"
      className="rounded-2xl border bg-amber-50/95 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 p-4 shadow-sm text-amber-900 dark:text-amber-100 transition-all text-xs"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {isHtmlError
                  ? 'Backend API Connection Notice (HTML Response Intercepted)'
                  : isDemoMode
                  ? 'Running in Offline Demo Mode'
                  : 'Backend API Notice'}
              </span>
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Demo
                </span>
              )}
            </div>
            <p className="mt-0.5 text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
              {isHtmlError ? (
                <>
                  The frontend received an HTML page (<code>&lt;!doctype html&gt;</code>) instead of JSON.
                  This happens when <code>VITE_API_URL</code> is unconfigured or points to the static host.
                </>
              ) : (
                errorMessage || (isDemoMode ? 'Using in-browser memory store.' : 'Unable to connect to Cloud Run API.')
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 font-medium transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configure URL</span>
            {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={onToggleDemoMode}
            className="px-2.5 py-1.5 rounded-lg bg-amber-200/50 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-medium transition-colors"
          >
            {isDemoMode ? 'Exit Demo' : 'Use Demo Mode'}
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="p-1.5 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 transition-colors"
            title="Retry Connection"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 transition-colors"
            title="Dismiss notice"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable URL Configuration Drawer */}
      {showConfig && (
        <form onSubmit={handleTestAndSave} className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/80 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Server className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://grocery-list-app-api-XXXXXXXXXX-uc.a.run.app"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                disabled={testing}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {testing && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Save & Test</span>
              </button>

              <button
                type="button"
                onClick={handleClearUrl}
                className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-1.5 p-2 rounded-lg ${
                testResult.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <p className="text-[10px] text-amber-800/80 dark:text-amber-300/70">
            Note: This custom backend URL is saved to your browser’s <code>localStorage</code> (<code>freshcart_api_url</code>) and used for subsequent requests.
          </p>
        </form>
      )}
    </div>
  );
};
