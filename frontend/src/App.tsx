import React, { useState, useEffect } from 'react';
import { useGroceryList } from './hooks/useGroceryList';
import { Header } from './components/Header';
import { ListSelectorModal } from './components/ListSelectorModal';
import { AddItemForm } from './components/AddItemForm';
import { FilterBar } from './components/FilterBar';
import { GroceryItemCard } from './components/GroceryItemCard';
import { BatchActionsBar } from './components/BatchActionsBar';
import { EmptyState } from './components/EmptyState';
import { CategoryBadge } from './components/CategoryBadge';
import { DiagnosticBanner } from './components/DiagnosticBanner';
import { ConnectionModal } from './components/ConnectionModal';
import { api, DEFAULT_PRODUCTION_API_URL } from './api/client';
import { AlertCircle, X, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('freshcart_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [listModalInitialCreate, setListModalInitialCreate] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const {
    lists,
    activeList,
    activeListId,
    setActiveListId,
    items,
    filteredItems,
    groupedItems,
    stats,
    loading,
    error,
    setError,
    isHtmlError,
    setIsHtmlError,
    isDemoMode,
    setIsDemoMode,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    isAisleView,
    setIsAisleView,
    toggleComplete,
    updateQuantity,
    addItem,
    deleteItem,
    clearCompleted,
    createList,
    deleteList,
    refresh
  } = useGroceryList();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('freshcart_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('freshcart_theme', 'light');
    }
  }, [darkMode]);

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || !!searchQuery.trim();

  const handleResetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
  };

  const showDiagnostic = (isHtmlError || isDemoMode) && !isBannerDismissed;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        activeList={activeList}
        onOpenListSelector={() => {
          setListModalInitialCreate(false);
          setIsListModalOpen(true);
        }}
        onOpenNewListModal={() => {
          setListModalInitialCreate(true);
          setIsListModalOpen(true);
        }}
        onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
        isBackendConnected={!isHtmlError && !isDemoMode && !error}
        backendLabel={!isHtmlError && !isDemoMode && !error ? 'Cloud Run API' : 'Configure API'}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Diagnostic Banner for HTML doctype errors or offline demo mode */}
        {showDiagnostic && (
          <DiagnosticBanner
            isHtmlError={isHtmlError}
            errorMessage={error}
            isDemoMode={isDemoMode}
            onToggleDemoMode={() => {
              if (isDemoMode) {
                setIsDemoMode(false);
                refresh();
              } else {
                setIsDemoMode(true);
              }
            }}
            onRetry={() => {
              setIsBannerDismissed(false);
              refresh();
            }}
            onDismiss={() => setIsBannerDismissed(true)}
            onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
          />
        )}

        {/* Standard Error Toast (only shown if not already displayed in DiagnosticBanner) */}
        {error && !isHtmlError && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Add Form */}
        <AddItemForm onAddItem={addItem} disabled={loading || !activeListId} />

        {/* Filters & Navigation */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          sortOption={sortOption}
          onSortChange={setSortOption}
          isAisleView={isAisleView}
          onToggleAisleView={() => setIsAisleView(!isAisleView)}
          items={items}
        />

        {/* Items List Content */}
        {loading && items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-medium">Loading grocery list...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
          />
        ) : isAisleView ? (
          /* Grouped by Aisle View */
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, catItems]) => (
              <section key={category} className="space-y-2.5">
                {/* Department Section Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={category} size="md" />
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      ({catItems.length} {catItems.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                </div>

                {/* Items in Category */}
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <GroceryItemCard
                      key={item.id}
                      item={item}
                      onToggleComplete={toggleComplete}
                      onUpdateQuantity={updateQuantity}
                      onDelete={deleteItem}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Flat List View */
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <GroceryItemCard
                key={item.id}
                item={item}
                onToggleComplete={toggleComplete}
                onUpdateQuantity={updateQuantity}
                onDelete={deleteItem}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Progress & Batch Actions Bar */}
      <BatchActionsBar
        total={stats.total}
        completed={stats.completed}
        percent={stats.percent}
        onClearCompleted={clearCompleted}
      />

      {/* List Selector / Creator Modal */}
      <ListSelectorModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        lists={lists}
        activeListId={activeListId}
        onSelectList={setActiveListId}
        onCreateList={createList}
        onDeleteList={deleteList}
        initialCreateMode={listModalInitialCreate}
      />

      {/* Backend API Connection Modal */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        onConnected={() => {
          setIsBannerDismissed(false);
          refresh();
        }}
      />
    </div>
  );
};
