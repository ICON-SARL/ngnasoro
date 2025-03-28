
import React, { useState } from 'react';
import { useSfdManagement } from './hooks/useSfdManagement';
import { SfdTable } from './sfd/SfdTable';
import { SuspendSfdDialog } from './sfd/SuspendSfdDialog';
import { ReactivateSfdDialog } from './sfd/ReactivateSfdDialog';
import { SfdForm } from './sfd/SfdForm';
import { SfdFilter } from './sfd/SfdFilter';
import { SfdHistory } from './sfd/SfdHistory';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SfdManagement() {
  const [activeTab, setActiveTab] = useState('sfds');
  
  const {
    filteredSfds,
    isLoading,
    isError,
    selectedSfd,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showSuspendDialog,
    setShowSuspendDialog,
    showReactivateDialog,
    setShowReactivateDialog,
    showAddDialog,
    setShowAddDialog,
    showEditDialog,
    setShowEditDialog,
    suspendSfdMutation,
    reactivateSfdMutation,
    addSfdMutation,
    editSfdMutation,
    handleAddSfd,
    handleEditSfd,
    handleShowEditDialog,
    handleSuspendSfd,
    handleReactivateSfd,
    handleExportPdf,
    handleExportExcel,
    handleExportCsv,
    isExporting
  } = useSfdManagement();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">
          Gestion des SFDs
        </h2>
        
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une SFD
        </Button>
      </div>
      
      <Tabs defaultValue="sfds" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sfds">Liste des SFDs</TabsTrigger>
          <TabsTrigger value="history">Historique des modifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sfds" className="space-y-4">
          <SfdFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
            onExportCsv={handleExportCsv}
            isExporting={isExporting}
          />
          
          <SfdTable 
            sfds={filteredSfds}
            isLoading={isLoading}
            isError={isError}
            onSuspend={handleSuspendSfd}
            onReactivate={handleReactivateSfd}
            onEdit={handleShowEditDialog}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <SfdHistory />
        </TabsContent>
      </Tabs>

      <SuspendSfdDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        selectedSfd={selectedSfd}
        onConfirm={(sfdId) => suspendSfdMutation.mutate(sfdId)}
        isPending={suspendSfdMutation.isPending}
      />

      <ReactivateSfdDialog
        open={showReactivateDialog}
        onOpenChange={setShowReactivateDialog}
        selectedSfd={selectedSfd}
        onConfirm={(sfdId) => reactivateSfdMutation.mutate(sfdId)}
        isPending={reactivateSfdMutation.isPending}
      />
      
      {/* Removing the open and onOpenChange props which are not in SfdForm */}
      <SfdForm
        defaultValues={{}}
        onSubmit={handleAddSfd}
        isLoading={addSfdMutation.isPending}
        isCreate={true}
      />
      
      <SfdForm
        defaultValues={selectedSfd || {}}
        onSubmit={handleEditSfd}
        isLoading={editSfdMutation.isPending}
        isCreate={false}
      />
    </div>
  );
}
