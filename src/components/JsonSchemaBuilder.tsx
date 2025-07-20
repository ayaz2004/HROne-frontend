import React, { useState, useCallback } from 'react';
import { Plus, Copy, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchemaFieldRow } from '@/components/SchemaFieldRow';
import type { SchemaField } from '@/types/schema';
import { generateJsonSchema, generateSampleData } from '@/types/schema';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const JsonSchemaBuilder: React.FC = () => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [activeTab, setActiveTab] = useState<'schema' | 'sample'>('schema');
  const [copyStatus, setCopyStatus] = useState<{ [key: string]: 'idle' | 'copied' }>({});

  const createNewField = useCallback((): SchemaField => ({
    id: generateId(),
    key: '',
    type: 'string',
  }), []);

  const addField = useCallback(() => {
    setFields(prev => [...prev, createNewField()]);
  }, [createNewField]);

  const updateField = useCallback((id: string, updates: Partial<SchemaField>) => {
    const updateFieldRecursive = (fields: SchemaField[]): SchemaField[] => {
      return fields.map(field => {
        if (field.id === id) {
          return { ...field, ...updates };
        }
        if (field.children) {
          return {
            ...field,
            children: updateFieldRecursive(field.children)
          };
        }
        return field;
      });
    };

    setFields(prev => updateFieldRecursive(prev));
  }, []);

  const deleteField = useCallback((id: string) => {
    const deleteFieldRecursive = (fields: SchemaField[]): SchemaField[] => {
      return fields.filter(field => field.id !== id).map(field => {
        if (field.children) {
          return {
            ...field,
            children: deleteFieldRecursive(field.children)
          };
        }
        return field;
      });
    };

    setFields(prev => deleteFieldRecursive(prev));
  }, []);

  const addSampleData = useCallback(() => {
    const sampleFields: SchemaField[] = [
      {
        id: generateId(),
        key: 'user',
        type: 'nested',
        children: [
          {
            id: generateId(),
            key: 'name',
            type: 'string'
          },
          {
            id: generateId(),
            key: 'email',
            type: 'string'
          },
          {
            id: generateId(),
            key: 'age',
            type: 'number'
          },
          {
            id: generateId(),
            key: 'address',
            type: 'nested',
            children: [
              {
                id: generateId(),
                key: 'street',
                type: 'string'
              },
              {
                id: generateId(),
                key: 'city',
                type: 'string'
              },
              {
                id: generateId(),
                key: 'coordinates',
                type: 'nested',
                children: [
                  {
                    id: generateId(),
                    key: 'lat',
                    type: 'number'
                  },
                  {
                    id: generateId(),
                    key: 'lng',
                    type: 'number'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
    setFields(sampleFields);
  }, []);

  const clearFields = useCallback(() => {
    setFields([]);
  }, []);

  const copyToClipboard = useCallback(async (content: string, section: 'schema' | 'sample') => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus(prev => ({ ...prev, [section]: 'copied' }));
      setTimeout(() => setCopyStatus(prev => ({ ...prev, [section]: 'idle' })), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  const saveAsFile = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const addChildField = useCallback((parentId: string) => {
    const addChildRecursive = (fields: SchemaField[]): SchemaField[] => {
      return fields.map(field => {
        if (field.id === parentId) {
          return {
            ...field,
            children: [...(field.children || []), createNewField()]
          };
        }
        if (field.children) {
          return {
            ...field,
            children: addChildRecursive(field.children)
          };
        }
        return field;
      });
    };

    setFields(prev => addChildRecursive(prev));
  }, [createNewField]);

  const jsonSchema = generateJsonSchema(fields);
  const sampleData = generateSampleData(fields);

  return (
    <div className="container">
      <div className="split-layout">
        <div className="panel-left">
          <div className="card">
            <div className="header">
              <h1 className="title">JSON Schema Builder</h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                {fields.length > 0 && (
                  <Button onClick={clearFields} variant="secondary" size="sm">
                    Clear All
                  </Button>
                )}
                <Button onClick={addSampleData} variant="secondary">
                  Load Sample
                </Button>
                <Button onClick={addField}>
                  <Plus style={{ width: 16, height: 16 }} />
                  Add Field
                </Button>
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: '18px', marginBottom: '16px' }}>No fields added yet</p>
                <p style={{ marginBottom: '20px' }}>Click "Add Field" to start building your schema</p>
                
                <div style={{ 
                  background: '#f0f9ff', 
                  border: '1px solid #bae6fd', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  textAlign: 'left',
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  <h4 style={{ color: '#0369a1', marginBottom: '8px' }}>💡 Try building a nested structure:</h4>
                  <ol style={{ color: '#075985', lineHeight: '1.6', paddingLeft: '20px' }}>
                    <li>Add a field and name it "user"</li>
                    <li>Change its type to "Nested"</li>
                    <li>Click "Add Nested" to add child fields</li>
                    <li>Add fields like "name", "email", "address"</li>
                    <li>Make "address" nested too for recursive nesting!</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="fields-container">
                {fields.map(field => (
                  <SchemaFieldRow
                    key={field.id}
                    field={field}
                    onUpdateField={updateField}
                    onDeleteField={deleteField}
                    onAddChild={addChildField}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel-right">
          <div className="card">
            <div className="output-tabs">
              <button
                onClick={() => setActiveTab('schema')}
                className={`tab-button ${activeTab === 'schema' ? 'active' : ''}`}
              >
                JSON Schema
              </button>
              <button
                onClick={() => setActiveTab('sample')}
                className={`tab-button ${activeTab === 'sample' ? 'active' : ''}`}
              >
                Sample Data
              </button>
            </div>

            <div className="output-content">
              {activeTab === 'schema' && (
                <div>
                  <div className="subtitle">
                    <span>Generated JSON Schema</span>
                    <div className="code-actions">
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard(JSON.stringify(jsonSchema, null, 2), 'schema')}
                        disabled={fields.length === 0}
                      >
                        {copyStatus.schema === 'copied' ? (
                          <>
                            <Check style={{ width: 14, height: 14 }} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy style={{ width: 14, height: 14 }} />
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        className="save-button"
                        onClick={() => saveAsFile(JSON.stringify(jsonSchema, null, 2), 'schema.json')}
                        disabled={fields.length === 0}
                      >
                        <Download style={{ width: 14, height: 14 }} />
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="code-block">
                    {fields.length === 0 ? (
                      <div style={{ 
                        color: '#94a3b8', 
                        fontStyle: 'italic', 
                        textAlign: 'center', 
                        padding: '20px' 
                      }}>
                        No fields added yet. Add some fields to see the JSON schema.
                      </div>
                    ) : (
                      JSON.stringify(jsonSchema, null, 2)
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'sample' && (
                <div>
                  <div className="subtitle">
                    <span>Sample Data</span>
                    <div className="code-actions">
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard(JSON.stringify(sampleData, null, 2), 'sample')}
                        disabled={fields.length === 0}
                      >
                        {copyStatus.sample === 'copied' ? (
                          <>
                            <Check style={{ width: 14, height: 14 }} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy style={{ width: 14, height: 14 }} />
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        className="save-button"
                        onClick={() => saveAsFile(JSON.stringify(sampleData, null, 2), 'sample-data.json')}
                        disabled={fields.length === 0}
                      >
                        <Download style={{ width: 14, height: 14 }} />
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="code-block">
                    {fields.length === 0 ? (
                      <div style={{ 
                        color: '#94a3b8', 
                        fontStyle: 'italic', 
                        textAlign: 'center', 
                        padding: '20px' 
                      }}>
                        No fields added yet. Add some fields to see the sample data.
                      </div>
                    ) : (
                      JSON.stringify(sampleData, null, 2)
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
