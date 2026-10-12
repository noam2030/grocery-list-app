import React, { useState, useEffect } from 'react';
import { X, Server, CheckCircle2, XCircle, RefreshCw, Globe, Zap, RotateCcw } from 'lucide-react';
import { api, DEFAULT_PRODUCTION_API_URL, checkBackendHealth } from '../api/client';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnected
}) => {
  const [currentUrl, setCurrentUrl] = useState(() => api.getApiBaseUrl());
  const [inputUrl, setInputUrl] = useState(() => api.getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; status: number; message: string; latencyMs: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const active = api.getApiBaseUrl();
      setCurrentUrl(active);
      setInputUrl(active);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async (target?: string) => {
    const urlToTest = (target !== undefined ? target : inputUrl).trim();
    setTesting(true);
    setTestResult(null);
    try {
      const result = await checkBackendHealth(urlToTest);
      setTestResult(result);
      return result.ok;
    } finally {
      setTesting(false);
    }
  };

  const handleApply = async (urlToSave: string) => {
    const clean = urlToSave.trim().replace(/\/+$/, '');
    api.setApiBaseUrl(clean);
    setCurrentUrl(api.getApiBaseUrl());
    onConnected();
  };

  const handleApplyPreset = async (presetUrl: string) => {
    setInputUrl(presetUrl);
    setTesting(true);
    try {
      const result = await checkBackendHealth(presetUrl);
      setTestResult(result);
      if (result.ok) {
        api.setApiBaseUrl(presetUrl);
        setCurrentUrl(presetUrl);
        setTimeout(() => {
          onConnected();
          onClose();
        }, 500);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleResetToDefault = () => {
    api.setApiBaseUrl(null);
    const def = api.getApiBaseUrl();
    setInputUrl(def);
    setCurrentUrl(def);
    setTestResult({
      ok: true,
      status: 200,
      message: 'Reset to Cloud Run Production Default: ' + def,
      latencyMs: 0
    });
    onConnected();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connection-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 id="connection-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Backend API Connection Settings
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure connection to Google Cloud Run API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Active Backend Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Active API Target:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[260px]">
                {currentUrl || 'Relative (Static Host)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Google Cloud Run service: <code className="text-emerald-600 dark:text-emerald-400">grocery-list-app-api</code> in project <code className="text-slate-700 dark:text-slate-300">ai-learning-499409</code>
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Quick Connect Presets
            </label>

            {/* Cloud Run Live Preset */}
            <button
              type="button"
              onClick={() => handleApplyPreset(DEFAULT_PRODUCTION_API_URL)}
              disabled={testing}
              className="w-full text-left p-3 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-emerald-500 text-white shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <span>Google Cloud Run (Live Production)</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded font-bold">
                      Recommended
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-emerald-700/90 dark:text-emerald-300/80 truncate">
                    {DEFAULT_PRODUCTION_API_URL}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0 ml-2 group-hover:underline">
                Connect
              </span>
            </button>

            {/* Localhost Preset */}
            <button
              type="button"
              onClick={() => handleApplyPreset('http://localhost:8080')}
              disabled={testing}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                    Local Development
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    http://localhost:8080
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 shrink-0 ml-2 group-hover:underline">
                Connect
              </span>
            </button>
          </div>

          {/* Custom URL Configuration */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Custom API Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://grocery-list-app-api-XXXXXXXXXX-uc.a.run.app"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleTest()}
                disabled={testing}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                {testing && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Test</span>
              </button>
            </div>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold">
                  {testResult.ok ? 'Connection Verified' : 'Connection Failed'}
                  {testResult.latencyMs > 0 && (
                    <span className="font-normal text-[11px] opacity-80 ml-1.5">
                      ({testResult.latencyMs}ms)
                    </span>
                  )}
                </div>
                <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Cloud Run</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleApply(inputUrl);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-sm"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
