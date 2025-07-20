import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { SchemaField, FieldType } from '@/types/schema';

interface SchemaFieldRowProps {
  field: SchemaField;
  onUpdateField: (id: string, updates: Partial<SchemaField>) => void;
  onDeleteField: (id: string) => void;
  onAddChild: (parentId: string) => void;
  depth?: number;
}

export const SchemaFieldRow: React.FC<SchemaFieldRowProps> = ({
  field,
  onUpdateField,
  onDeleteField,
  onAddChild,
  depth = 0
}) => {
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateField(field.id, { key: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as FieldType;
    const updates: Partial<SchemaField> = { type: newType };
    
    if (newType === 'nested' && !field.children) {
      updates.children = [];
      updates.value = undefined; // Clear value for nested fields
    }
    else if (newType !== 'nested') {
      updates.children = undefined;
      // Keep existing value or set empty string if no value exists
      if (field.value === undefined) {
        updates.value = '';
      }
    }
    
    onUpdateField(field.id, updates);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateField(field.id, { value: e.target.value });
  };

  const containerClass = depth > 0 ? 'nested-field' : '';

  return (
    <div className={containerClass}>
      <div className="field-row">
        <Input
          type="text"
          value={field.key}
          onChange={handleKeyChange}
          placeholder="Field name"
          style={{ flex: 1 }}
        />
        
        <Select value={field.type} onChange={handleTypeChange}>
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="nested">Nested</option>
        </Select>
        
        {field.type !== 'nested' && (
          <Input
            type={field.type === 'number' ? 'number' : 'text'}
            value={field.value || ''}
            onChange={handleValueChange}
            placeholder={field.type === 'number' ? 'Enter number' : 'Enter value'}
            style={{ flex: 1 }}
          />
        )}
        
        {field.type === 'nested' && (
          <Button
            onClick={() => onAddChild(field.id)}
            variant="secondary"
            size="sm"
            className="add-nested-btn"
          >
            <Plus style={{ width: 16, height: 16, marginRight: 4 }} />
            Add Nested
          </Button>
        )}
        
        <Button
          onClick={() => onDeleteField(field.id)}
          variant="destructive"
          size="sm"
          title="Delete field"
        >
          <Trash2 style={{ width: 16, height: 16 }} />
        </Button>
      </div>
      
      {field.type === 'nested' && (
        <div className="nested-container">
          {field.children && field.children.length > 0 ? (
            field.children.map(child => (
              <SchemaFieldRow
                key={child.id}
                field={child}
                onUpdateField={onUpdateField}
                onDeleteField={onDeleteField}
                onAddChild={onAddChild}
                depth={depth + 1}
              />
            ))
          ) : (
            <div style={{ 
              padding: '16px', 
              textAlign: 'center', 
              color: '#6b7280', 
              fontStyle: 'italic',
              background: '#f9fafb',
              border: '1px dashed #d1d5db',
              borderRadius: '4px',
              margin: '8px 0'
            }}>
              No nested fields yet. Click "Add Nested" to add child fields.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
