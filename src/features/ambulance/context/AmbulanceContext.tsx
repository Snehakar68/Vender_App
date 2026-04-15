import React, { createContext, useContext, useState } from 'react';
import {
  Ambulance,
  Driver,
  MOCK_AMBULANCES,
  MOCK_DRIVERS,
} from '@/src/features/ambulance/data/mockData';

// ─── Context Type ─────────────────────────────────────────────────────────────

interface AmbulanceContextType {
  ambulances: Ambulance[];
  drivers: Driver[];
  // Ambulance CRUD
  addAmbulance: (data: Omit<Ambulance, 'id'>) => void;
  updateAmbulance: (id: string, data: Partial<Ambulance>) => void;
  deleteAmbulance: (id: string) => void;
  getAmbulanceById: (id: string) => Ambulance | undefined;
  // Driver CRUD
  addDriver: (data: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, data: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  getDriverById: (id: string) => Driver | undefined;
}

// ─── Context + Provider ───────────────────────────────────────────────────────

const AmbulanceContext = createContext<AmbulanceContextType | null>(null);

export function AmbulanceProvider({ children }: { children: React.ReactNode }) {
  const [ambulances, setAmbulances] = useState<Ambulance[]>(MOCK_AMBULANCES);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);

  // ── Ambulance operations ──────────────────────────────────────────────────

  const addAmbulance = (data: Omit<Ambulance, 'id'>) => {
    const newItem: Ambulance = { ...data, id: Date.now().toString() };
    setAmbulances((prev) => [newItem, ...prev]);
  };

  const updateAmbulance = (id: string, data: Partial<Ambulance>) => {
    setAmbulances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a))
    );
  };

  const deleteAmbulance = (id: string) => {
    setAmbulances((prev) => prev.filter((a) => a.id !== id));
  };

  const getAmbulanceById = (id: string): Ambulance | undefined => {
    return ambulances.find((a) => a.id === id);
  };

  // ── Driver operations ─────────────────────────────────────────────────────

  const addDriver = (data: Omit<Driver, 'id'>) => {
    const newItem: Driver = { ...data, id: Date.now().toString() };
    setDrivers((prev) => [newItem, ...prev]);
  };

  const updateDriver = (id: string, data: Partial<Driver>) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data } : d))
    );
  };

  const deleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  const getDriverById = (id: string): Driver | undefined => {
    return drivers.find((d) => d.id === id);
  };

  return (
    <AmbulanceContext.Provider
      value={{
        ambulances,
        drivers,
        addAmbulance,
        updateAmbulance,
        deleteAmbulance,
        getAmbulanceById,
        addDriver,
        updateDriver,
        deleteDriver,
        getDriverById,
      }}
    >
      {children}
    </AmbulanceContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAmbulanceContext(): AmbulanceContextType {
  const ctx = useContext(AmbulanceContext);
  if (!ctx) {
    throw new Error('useAmbulanceContext must be used within AmbulanceProvider');
  }
  return ctx;
}
