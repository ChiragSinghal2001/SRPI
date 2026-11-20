import { Property } from '../types/property';
import { MOCK_PROPERTIES } from './mockData';

// In-memory property state for simulation
let properties = [...MOCK_PROPERTIES];

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    await new Promise((res) => setTimeout(res, 300));
    return [...properties];
  },

  async getPropertyById(id: string): Promise<Property> {
    await new Promise((res) => setTimeout(res, 250));
    const property = properties.find((p) => p.id === id);
    if (!property) throw new Error(`Property ${id} not found`);
    return { ...property };
  },

  async createProperty(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    await new Promise((res) => setTimeout(res, 400));
    const newProperty: Property = {
      ...data,
      id: `prop_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    properties = [newProperty, ...properties];
    return newProperty;
  },

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    await new Promise((res) => setTimeout(res, 350));
    const index = properties.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Property ${id} not found`);
    properties[index] = {
      ...properties[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return properties[index];
  },
};

export default propertyService;
