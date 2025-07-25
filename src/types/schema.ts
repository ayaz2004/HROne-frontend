export type FieldType = 'string' | 'number' | 'nested';

export interface SchemaField {
  id: string;
  key: string;
  type: FieldType;
  value?: string;
  children?: SchemaField[];
}

export interface JsonSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
}

export const getDefaultValue = (type: FieldType, key?: string): unknown => {
  switch (type) {
    case 'string':
      if (key) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('name')) return 'John Doe';
        if (lowerKey.includes('email')) return 'john.doe@example.com';
        if (lowerKey.includes('city')) return 'New York';
        if (lowerKey.includes('title')) return 'Sample Title';
      }
      return 'sample text';
    case 'number':
      if (key) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('age')) return 25;
        if (lowerKey.includes('price')) return 99.99;
        if (lowerKey.includes('id')) return 12345;
      }
      return 42;
    case 'nested':
      return {};
    default:
      return null;
  }
};

export const generateJsonSchema = (fields: SchemaField[]): JsonSchema => {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  
  fields.forEach(field => {
    if (!field.key.trim()) return;
    
    if (field.type === 'nested' && field.children && field.children.length > 0) {
      const nestedSchema = generateJsonSchema(field.children);
      properties[field.key] = nestedSchema;
      required.push(field.key);
    } else if (field.type !== 'nested') {
      properties[field.key] = {
        type: field.type === 'number' ? 'number' : 'string'
      };
      required.push(field.key);
    }
  });
  
  const schema: JsonSchema = {
    type: 'object',
    properties
  };
  
  if (required.length > 0) {
    schema.required = required;
  }
  
  return schema;
};

export const generateSampleData = (fields: SchemaField[]): Record<string, unknown> => {
  const data: Record<string, unknown> = {};
  
  fields.forEach(field => {
    if (!field.key.trim()) return;
    
    if (field.type === 'nested' && field.children && field.children.length > 0) {
      data[field.key] = generateSampleData(field.children);
    } else if (field.type !== 'nested') {
      // Use custom value if provided, otherwise use default
      if (field.value !== undefined && field.value !== '') {
        if (field.type === 'number') {
          const numValue = parseFloat(field.value);
          data[field.key] = isNaN(numValue) ? 0 : numValue;
        } else {
          data[field.key] = field.value;
        }
      } else {
        data[field.key] = getDefaultValue(field.type, field.key);
      }
    }
  });
  
  return data;
};

export const formatJsonOutput = (obj: unknown): string => {
  return JSON.stringify(obj, null, 2);
};
