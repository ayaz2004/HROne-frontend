import React, { useState, useCallback } from 'react';
import { Plus, Copy, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchemaFieldRow } from '@/components/SchemaFieldRow';
import type { SchemaField } from '@/types/schema';
import { generateJsonSchema, generateSampleData, formatJsonOutput } from '@/types/schema';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const JsonSchemaBuilder: React.FC = () => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [activeTab, setActiveTab] = useState<'schema' | 'sample'>('schema');
  const [copyStatus, setCopyStatus] = useState<{ [key: string]: 'idle' | 'copied' }>({});

  const createNewField = useCallback((): SchemaField => ({
    id: generateId(),
    key: '',
    type: 'string',
    value: '',
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

  const addUserProfileSample = useCallback(() => {
    const userSample: SchemaField[] = [
      {
        id: generateId(),
        key: 'user',
        type: 'nested',
        children: [
          {
            id: generateId(),
            key: 'name',
            type: 'string',
            value: 'John Doe'
          },
          {
            id: generateId(),
            key: 'email',
            type: 'string',
            value: 'john@example.com'
          },
          {
            id: generateId(),
            key: 'age',
            type: 'number',
            value: '25'
          }
        ]
      }
    ];
    setFields(userSample);
  }, []);

  const addProductSample = useCallback(() => {
    const productSample: SchemaField[] = [
      {
        id: generateId(),
        key: 'product',
        type: 'nested',
        children: [
          {
            id: generateId(),
            key: 'title',
            type: 'string',
            value: 'Product Name'
          },
          {
            id: generateId(),
            key: 'price',
            type: 'number',
            value: '99.99'
          },
          {
            id: generateId(),
            key: 'category',
            type: 'string',
            value: 'Electronics'
          }
        ]
      }
    ];
    setFields(productSample);
  }, []);

  const addCompanySample = useCallback(() => {
    const companySample: SchemaField[] = [
      {
        id: generateId(),
        key: 'company',
        type: 'nested',
        children: [
          {
            id: generateId(),
            key: 'name',
            type: 'string',
            value: 'Tech Solutions Inc.'
          },
          {
            id: generateId(),
            key: 'founded',
            type: 'number',
            value: '2010'
          },
          {
            id: generateId(),
            key: 'employees',
            type: 'number',
            value: '150'
          }
        ]
      }
    ];
    setFields(companySample);
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
                <Button onClick={addField}>
                  <Plus style={{ width: 16, height: 16 }} />
                  Add Field
                </Button>
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="empty-state">
                <p>No fields added yet</p>
                <p>Click "Add Field" to start building your schema</p>
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
                        onClick={() => copyToClipboard(formatJsonOutput(jsonSchema), 'schema')}
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
                        onClick={() => saveAsFile(formatJsonOutput(jsonSchema), 'schema.json')}
                        disabled={fields.length === 0}
                      >
                        <Download style={{ width: 14, height: 14 }} />
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="code-block">
                    {fields.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                        No fields added yet.
                      </div>
                    ) : (
                      formatJsonOutput(jsonSchema)
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
                        onClick={() => copyToClipboard(formatJsonOutput(sampleData), 'sample')}
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
                        onClick={() => saveAsFile(formatJsonOutput(sampleData), 'sample-data.json')}
                        disabled={fields.length === 0}
                      >
                        <Download style={{ width: 14, height: 14 }} />
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="code-block">
                    {fields.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                        No fields added yet.
                      </div>
                    ) : (
                      formatJsonOutput(sampleData)
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Sample Data Section */}
      <div style={{ 
        marginTop: '32px', 
        padding: '24px', 
        background: 'white', 
        borderRadius: '16px', 
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#374151', textAlign: 'center' }}>
          Quick Start Templates
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fafbfc' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              👤 User Profile
            </h4>
            <Button onClick={addUserProfileSample} variant="primary" size="sm" style={{ width: '100%' }}>
              Load User Schema
            </Button>
          </div>

          <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fafbfc' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              🛍️ Product Catalog
            </h4>
            <Button onClick={addProductSample} variant="primary" size="sm" style={{ width: '100%' }}>
              Load Product Schema
            </Button>
          </div>

          <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fafbfc' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              🏢 Company Data
            </h4>
            <Button onClick={addCompanySample} variant="primary" size="sm" style={{ width: '100%' }}>
              Load Company Schema
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
