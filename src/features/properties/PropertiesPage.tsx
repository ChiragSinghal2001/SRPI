import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Users,
  ChevronRight,
  Layers,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { propertyService } from '../../services/propertyService';
import { Property } from '../../types/property';
import { useAppDispatch } from '../../hooks/useRedux';
import { addToast } from '../../store/slices/uiSlice';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export const PropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding/editing property
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('CA');
  const [zip, setZip] = useState('');
  const [roomsInput, setRoomsInput] = useState('Living Room, Master Bedroom, Kitchen, Bathroom');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: properties,
    loading,
    refetch,
  } = useFetch(() => propertyService.getProperties(), []);

  const filteredProperties =
    properties?.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const roomList = roomsInput
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      await propertyService.createProperty({
        name: propertyName,
        address,
        unit,
        city,
        state: stateCode,
        zip,
        rooms: roomList.length > 0 ? roomList : ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom'],
        status: 'vacant',
        imageUrl:
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80',
      });

      await refetch();
      setShowAddModal(false);
      dispatch(
        addToast({
          type: 'success',
          title: 'Property Added',
          message: `${propertyName} has been registered to your portfolio.`,
        })
      );

      // Reset form
      setPropertyName('');
      setAddress('');
      setUnit('');
      setCity('');
      setZip('');
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Failed to add property',
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header with Search and Add Property Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Properties Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage units, room definitions, and associated lease documentation
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus size={15} /> Add New Property
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by property name, address, or city..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 shadow-2xs"
        />
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => navigate(`/properties/${prop.id}`)}
              className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Image & Status Badge */}
                <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                  <img
                    src={prop.imageUrl}
                    alt={prop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${
                        prop.status === 'occupied'
                          ? 'bg-emerald-600/90 text-white'
                          : prop.status === 'under_inspection'
                          ? 'bg-amber-600/90 text-white'
                          : 'bg-slate-800/90 text-slate-200'
                      }`}
                    >
                      {prop.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {prop.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={13} className="shrink-0" />
                      {prop.address}, {prop.city}, {prop.state} {prop.zip}
                    </p>
                  </div>

                  {/* Rooms List Pill preview */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Layers size={13} className="text-slate-400 shrink-0" />
                    {prop.rooms.slice(0, 3).map((room) => (
                      <span
                        key={room}
                        className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        {room}
                      </span>
                    ))}
                    {prop.rooms.length > 3 && (
                      <span className="text-[10px] text-slate-400">
                        +{prop.rooms.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tenant Footer Bar */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Users size={13} />
                  {prop.currentTenant ? prop.currentTenant.name : 'No Active Lease'}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                  View Detail <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Add New Rental Property
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property / Building Name
                </label>
                <input
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Parkview Residences - Unit 2B"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Street Address
                  </label>
                  <input
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit #
                  </label>
                  <input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="2B"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Springfield"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    required
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    placeholder="OR"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Zip Code
                  </label>
                  <input
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="97477"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rooms (Comma separated)
                </label>
                <input
                  value={roomsInput}
                  onChange={(e) => setRoomsInput(e.target.value)}
                  placeholder="Living Room, Master Bedroom, Kitchen, Bathroom"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Defines the rooms to photograph in the inspection wizard.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
