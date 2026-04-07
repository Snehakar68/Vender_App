export type Department = {
  id: string;
  name: string;
  specialty: string;
  icon: string;
  description: string;
};

export const DEPARTMENTS: Department[] = [
  {
    id: 'cardiology',
    name: 'Cardiologist',
    specialty: 'Heart & Vascular',
    icon: 'favorite',
    description: 'Specialized heart monitoring and care at home.',
  },
  {
    id: 'dentist',
    name: 'Dentist',
    specialty: 'Oral Hygiene',
    icon: 'coronavirus',
    description: 'Dental care and oral health support.',
  },
  {
    id: 'neurology',
    name: 'Neurologist',
    specialty: 'Brain & Nerves',
    icon: 'device-hub',
    description: 'Neurological health support and rehabilitation.',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    specialty: 'Child Specialist',
    icon: 'child-friendly',
    description: 'Comprehensive child healthcare at home.',
  },
  {
    id: 'ent',
    name: 'ENT',
    specialty: 'Ear, Nose, Throat',
    icon: 'hearing',
    description: 'ENT conditions treatment and care.',
  },
  {
    id: 'radiology',
    name: 'Radiology',
    specialty: 'X-Ray & Scans',
    icon: 'image-search',
    description: 'Diagnostic imaging services.',
  },
  {
    id: 'orthopedic',
    name: 'Orthopedic',
    specialty: 'Bones & Joints',
    icon: 'accessible',
    description: 'Bone, joint and muscle care.',
  },
  {
    id: 'physio',
    name: 'Physiotherapy',
    specialty: 'Rehabilitation',
    icon: 'self-improvement',
    description: 'Mobility and pain management exercises.',
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    specialty: 'Mental Wellness',
    icon: 'psychology-alt',
    description: 'Mental health support and therapy.',
  },
];
