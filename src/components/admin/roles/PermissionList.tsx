
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Permission } from './types';
import { GripVertical } from 'lucide-react';

interface PermissionListProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onTogglePermission: (permissionId: string) => void;
  draggable?: boolean;
}

export function PermissionList({ 
  permissions, 
  selectedPermissions, 
  onTogglePermission,
  draggable = false
}: PermissionListProps) {
  if (draggable) {
    return (
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="permissions-list">
          {(provided) => (
            <div 
              className="border rounded-md p-3 space-y-3"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {permissions.map((permission, index) => (
                <Draggable key={permission.id} draggableId={permission.id} index={index}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center justify-between bg-white p-3 rounded-md border"
                    >
                      <div className="flex items-center">
                        <span {...provided.dragHandleProps} className="mr-2 text-gray-400">
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-muted-foreground">{permission.description}</div>
                        </div>
                      </div>
                      <Switch 
                        checked={selectedPermissions?.includes(permission.id) || false}
                        onCheckedChange={() => onTogglePermission(permission.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  return (
    <div className="border rounded-md p-3 space-y-3">
      {permissions.map(permission => (
        <div key={permission.id} className="flex items-center justify-between">
          <div>
            <div className="font-medium">{permission.name}</div>
            <div className="text-sm text-muted-foreground">{permission.description}</div>
          </div>
          <Switch 
            checked={selectedPermissions?.includes(permission.id) || false}
            onCheckedChange={() => onTogglePermission(permission.id)}
          />
        </div>
      ))}
    </div>
  );
}
