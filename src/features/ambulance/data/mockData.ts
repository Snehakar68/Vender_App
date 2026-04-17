// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  type: 'Basic' | 'Advanced';
  ratePerKm: number;
  status: 'Active' | 'Inactive';
  crewInitials: string[];
  maintenanceNote?: string;
  driverName?: string;
  lastLocationTime?: string;
  photoUri?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  permitExpiry?: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  status: 'Online' | 'Offline';
  assignedAmbulance: string;
  initials: string;
  phone?: string;
  photoUri?: string;
  licenseExpiry?: string;
  licenseDocUri?: string;
}

export interface Trip {
  id: string;
  tripId: string;
  title: string;
  status: 'Ongoing' | 'Completed' | 'Cancelled';
  patientName?: string;
  vehicleNumber?: string;
  startTime?: string;
  estimatedFare?: string;
  date?: string;
  actualFare?: string;
  cancellationNote?: string;
}

export interface ActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}

export interface RevenueBar {
  label: string;
  amount: string;
  progress: number;
}

export interface PulseCard {
  label: string;
  value: number | string;
  accent: string;
  bgColor: string;
}

// ─── Mock Ambulances ──────────────────────────────────────────────────────────

export const MOCK_AMBULANCES: Ambulance[] = [
  {
    id: '1',
    vehicleNumber: 'WB 23B 4412',
    type: 'Advanced',
    ratePerKm: 25,
    status: 'Active',
    crewInitials: ['JS', 'MK'],
    driverName: 'Rahul Singh',
    lastLocationTime: '2 min ago',
    insuranceExpiry: '2025-06-30',
    fitnessExpiry: '2025-12-01',
    permitExpiry: '2026-03-15',
  },
  {
    id: '2',
    vehicleNumber: 'WB 12A 9901',
    type: 'Basic',
    ratePerKm: 18,
    status: 'Inactive',
    crewInitials: [],
    maintenanceNote: 'Under Maintenance',
    driverName: 'Amit Verma',
    lastLocationTime: '1 hr ago',
    insuranceExpiry: '2024-11-20',
  },
  {
    id: '3',
    vehicleNumber: 'WB 04C 1122',
    type: 'Advanced',
    ratePerKm: 28,
    status: 'Active',
    crewInitials: ['RD'],
    driverName: 'Priya Sharma',
    lastLocationTime: '5 min ago',
    insuranceExpiry: '2025-09-10',
    fitnessExpiry: '2026-01-20',
    permitExpiry: '2026-06-01',
  },
  {
    id: '4',
    vehicleNumber: 'UP 32 AB 5521',
    type: 'Advanced',
    ratePerKm: 35,
    status: 'Active',
    crewInitials: ['PK', 'SM'],
    driverName: 'Deepak Kumar',
    lastLocationTime: 'Just now',
    insuranceExpiry: '2025-08-15',
    fitnessExpiry: '2025-11-30',
    permitExpiry: '2025-12-31',
  },
  {
    id: '5',
    vehicleNumber: 'MH 01 BK 0092',
    type: 'Basic',
    ratePerKm: 15,
    status: 'Inactive',
    crewInitials: [],
    maintenanceNote: 'Service Due',
    lastLocationTime: '3 hr ago',
  },
];

// ─── Mock Drivers ─────────────────────────────────────────────────────────────

export const MOCK_DRIVERS: Driver[] = [
  {
    id: '1',
    name: 'Rahul Singh',
    licenseNumber: 'DL-12345',
    status: 'Online',
    assignedAmbulance: 'Ambulance #402',
    initials: 'RS',
    phone: '+91 98765 43210',
    licenseExpiry: '2027-05-14',
  },
  {
    id: '2',
    name: 'Amit Verma',
    licenseNumber: 'DL-88291',
    status: 'Offline',
    assignedAmbulance: 'Ambulance #305',
    initials: 'AV',
    phone: '+91 91234 56789',
    licenseExpiry: '2026-11-30',
  },
  {
    id: '3',
    name: 'Priya Sharma',
    licenseNumber: 'DL-55210',
    status: 'Online',
    assignedAmbulance: 'Ambulance #112',
    initials: 'PS',
    phone: '+91 87654 32109',
    licenseExpiry: '2028-02-20',
  },
  {
    id: '4',
    name: 'Deepak Kumar',
    licenseNumber: 'DL-99312',
    status: 'Online',
    assignedAmbulance: 'Ambulance #204',
    initials: 'DK',
    phone: '+91 76543 21098',
    licenseExpiry: '2026-08-05',
  },
];

// ─── Mock Trips ───────────────────────────────────────────────────────────────

export const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    tripId: 'JHC-9921',
    title: 'Ongoing Care',
    status: 'Ongoing',
    patientName: 'Amitav Gosh (Cardiac Pt)',
    vehicleNumber: 'WB-04-AX-5521 (Advanced Life Support)',
    startTime: 'Today, 10:45 AM',
    estimatedFare: '₹2,850',
  },
  {
    id: '2',
    tripId: 'JHC-9844',
    title: 'Emergency Transfer',
    status: 'Completed',
    patientName: 'Sunita Devi',
    vehicleNumber: 'WB-01-BK-0092',
    date: 'Oct 24, 2023',
    actualFare: '₹1,200',
  },
  {
    id: '3',
    tripId: 'JHC-9812',
    title: 'Home Recovery Drop',
    status: 'Completed',
    patientName: "Robert D'Souza",
    vehicleNumber: 'WB-42-CD-1122',
    date: 'Oct 22, 2023',
    actualFare: '₹950',
  },
  {
    id: '4',
    tripId: 'JHC-9755',
    title: 'Routine Checkup',
    status: 'Cancelled',
    cancellationNote: 'Cancelled by User (No charge)',
  },
];

// ─── Mock Activity Feed ───────────────────────────────────────────────────────

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    icon: 'departure-board',
    iconBg: 'rgba(0,101,101,0.1)',
    iconColor: '#006565',
    title: 'Ambulance UP32AB1234 started trip',
    subtitle: '2 mins ago • Emergency Call',
  },
  {
    id: '2',
    icon: 'person-off',
    iconBg: 'rgba(92,95,96,0.1)',
    iconColor: '#5c5f60',
    title: 'Driver Rahul went offline',
    subtitle: '15 mins ago • Shift Ended',
  },
  {
    id: '3',
    icon: 'check-circle',
    iconBg: 'rgba(0,105,35,0.1)',
    iconColor: '#006923',
    title: 'Trip Completed: Advanced Unit 04',
    subtitle: '28 mins ago • Apollo Hospital',
  },
];

// ─── Mock Revenue Bars ────────────────────────────────────────────────────────

export const MOCK_REVENUE_BARS: RevenueBar[] = [
  { label: 'Emergency (Advanced)', amount: '₹340,000', progress: 0.85 },
  { label: 'Advanced ICU', amount: '₹210,000', progress: 0.55 },
  { label: 'Inter-Hospital', amount: '₹185,000', progress: 0.45 },
  { label: 'Scheduled', amount: '₹120,000', progress: 0.30 },
];

// ─── Mock Pulse Cards ─────────────────────────────────────────────────────────

export const MOCK_PULSE_CARDS: PulseCard[] = [
  { label: 'Total Ambulances', value: 25, accent: '#006565', bgColor: '#ffffff' },
  { label: 'Active', value: 18, accent: '#e3fffe', bgColor: '#008080' },
  { label: 'Available Drivers', value: 12, accent: '#006923', bgColor: '#ffffff' },
  { label: 'On Trip', value: 5, accent: '#76d6d5', bgColor: '#ffffff' },
  { label: 'Offline', value: 2, accent: '#ba1a1a', bgColor: '#ffffff' },
];
