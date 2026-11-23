import { Property } from '../types/property';
import { syncLoadJsonData, loadJsonData, saveJsonData } from './jsonStorage';

let properties: Property[] = syncLoadJsonData<Property[]>('properties');

// Refresh from disk .json file on app startup
loadJsonData<Property[]>('properties').then((props) => {
  if (props && props.length > 0) {
    properties = props;
  }
});

export const propertyService = {
  async getProperties(filter?: { landlordId?: string; status?: string }): Promise<Property[]> {
    await new Promise((res) => setTimeout(res, 150));
    const all = await loadJsonData<Property[]>('properties');
    if (all && all.length > 0) {
      properties = all;
    }
    let result = [...properties];
    if (filter?.landlordId) {
      result = result.filter((p) => p.landlordId === filter.landlordId);
    }
    if (filter?.status) {
      result = result.filter((p) => p.status === filter.status);
    }
    return result;
  },

  async getAllProperties(): Promise<Property[]> {
    const all = await loadJsonData<Property[]>('properties');
    if (all && all.length > 0) {
      properties = all;
    }
    return [...properties];
  },

  async getAvailableProperties(): Promise<Property[]> {
    const all = await loadJsonData<Property[]>('properties');
    if (all && all.length > 0) {
      properties = all;
    }
    return properties.filter((p) => p.status === 'vacant' || !p.currentTenant);
  },

  async getPropertyById(id: string): Promise<Property> {
    await new Promise((res) => setTimeout(res, 150));
    const all = await loadJsonData<Property[]>('properties');
    if (all && all.length > 0) {
      properties = all;
    }
    const property = properties.find((p) => p.id === id);
    if (!property) throw new Error(`Property ${id} not found`);
    return { ...property };
  },

  async createProperty(
    data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>,
    landlordId?: string
  ): Promise<Property> {
    await new Promise((res) => setTimeout(res, 250));
    const all = await loadJsonData<Property[]>('properties');
    if (all && all.length > 0) {
      properties = all;
    }
    const newProperty: Property = {
      ...data,
      id: `prop_${Date.now()}`,
      landlordId: landlordId || data.landlordId || 'usr_landlord_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    properties = [newProperty, ...properties];
    // Persist directly to src/data/properties.json on disk!
    await saveJsonData('properties', properties);
    return newProperty;
  },

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    await new Promise((res) => setTimeout(res, 200));
    const all = await loadJsonData<Property[]>('properties');
    if (all && all.length > 0) {
      properties = all;
    }
    const index = properties.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Property ${id} not found`);
    properties[index] = {
      ...properties[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    // Persist directly to src/data/properties.json on disk!
    await saveJsonData('properties', properties);
    return { ...properties[index] };
  },

  async deleteProperty(id: string): Promise<void> {
    const all = await loadJsonData<Property[]>('properties');
    properties = (all || []).filter((p) => p.id !== id);
    // Persist directly to src/data/properties.json on disk!
    await saveJsonData('properties', properties);
  },
};

export default propertyService;
