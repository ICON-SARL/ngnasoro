import React from 'react';
import { AddSfdAdminDialog } from '@/components/admin/sfd/AddSfdAdminDialog';
import { SfdAddDialog } from '@/components/admin/sfd/SfdAddDialog';
import { SfdHeader } from './SfdHeader';
import { NetworkStatusAlerts } from './NetworkStatusAlerts';
import { SfdList } from './SfdList';
import { SfdDetail } from './SfdDetail';
import { useSfdManagementContainerState } from './useSfdManagementContainerState';

export function SfdManagementContainer() {
  const {
    searchQuery,
    selectedSfd,
    showAddAdminDialog,
    showAddSfdDialog,
    retryCount,
    isRetrying,
    isOnline,
    isLoadingAdmin,
    error,
    sfds,
    isLoading,
    isError,
    filteredSfds,
    MAX_RETRIES,
    setSelectedSfd,
    setShowAddAdminDialog,
    setShowAddSfdDialog,
    handleAddAdmin,
    handleRefreshData,
    handleAddDialogChange,
    handleSearchChange
  } = useSfdManagementContainerState();

  return (
    <div className="space-y-6">
      <SfdHeader
        isLoading={isLoading}
        isRetrying={isRetrying}
        isOnline={isOnline}
        selectedSfd={selectedSfd}
        onRefresh={handleRefreshData}
        onAddSfd={() => setShowAddSfdDialog(true)}
        onAddAdmin={() => setShowAddAdminDialog(true)}
      />

      <NetworkStatusAlerts
        isOnline={isOnline}
        isError={isError}
        isRetrying={isRetrying}
        retryCount={retryCount}
        maxRetries={MAX_RETRIES}
        onRetry={handleRefreshData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SfdList
            sfds={sfds}
            filteredSfds={filteredSfds}
            isLoading={isLoading}
            isRetrying={isRetrying}
            searchQuery={searchQuery}
            selectedSfd={selectedSfd}
            retryCount={retryCount}
            maxRetries={MAX_RETRIES}
            onSearchChange={handleSearchChange}
            onSelectSfd={setSelectedSfd}
          />
        </div>

        <div className="lg:col-span-2">
          <SfdDetail
            selectedSfd={selectedSfd}
            onEdit={() => {/* Edit functionality */}}
          />
        </div>
      </div>

      {selectedSfd && (
        <AddSfdAdminDialog
          open={showAddAdminDialog}
          onOpenChange={setShowAddAdminDialog}
          sfdId={selectedSfd.id}
          sfdName={selectedSfd.name}
          onAddAdmin={handleAddAdmin}
          isLoading={isLoadingAdmin}
          error={error}
        />
      )}

      <SfdAddDialog
        open={showAddSfdDialog}
        onOpenChange={handleAddDialogChange}
      />
    </div>
  );
}
