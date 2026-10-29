export const ROLES = {
  CITIZEN: 'CITIZEN',
  VOLUNTEER: 'VOLUNTEER',
  NGO_REPRESENTATIVE: 'NGO_REPRESENTATIVE',
  DONOR: 'DONOR',
  GOV_OFFICIAL: 'GOV_OFFICIAL',
  HOSPITAL_REP: 'HOSPITAL_REP',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  CITIZEN: 'Citizen',
  VOLUNTEER: 'Volunteer',
  NGO_REPRESENTATIVE: 'NGO Representative',
  DONOR: 'Donor',
  GOV_OFFICIAL: 'Government Official',
  HOSPITAL_REP: 'Hospital Representative',
  ADMIN: 'System Administrator',
};

export const DEMO_ACCOUNTS = [
  { role: ROLES.ADMIN, email: 'admin@sdrrms.org', password: 'Admin@123', label: 'Admin' },
  { role: ROLES.GOV_OFFICIAL, email: 'official@sdrrms.org', password: 'Gov@123', label: 'Gov Official' },
  { role: ROLES.VOLUNTEER, email: 'volunteer@sdrrms.org', password: 'Volunteer@123', label: 'Volunteer' },
  { role: ROLES.CITIZEN, email: 'citizen@sdrrms.org', password: 'Citizen@123', label: 'Citizen' },
  { role: ROLES.NGO_REPRESENTATIVE, email: 'ngo@sdrrms.org', password: 'Ngo@123', label: 'NGO' },
  { role: ROLES.DONOR, email: 'donor@sdrrms.org', password: 'Donor@123', label: 'Donor' },
  { role: ROLES.HOSPITAL_REP, email: 'hospital@sdrrms.org', password: 'Hospital@123', label: 'Hospital' },
];

export const REQUEST_CATEGORIES = [
  { value: 'FOOD_WATER', label: 'Food & Drinking Water' },
  { value: 'MEDICAL', label: 'Medical Assistance' },
  { value: 'RESCUE', label: 'Emergency Rescue' },
  { value: 'SHELTER', label: 'Shelter & Tents' },
  { value: 'CLOTHING', label: 'Clothing & Blankets' },
  { value: 'OTHER', label: 'Other Relief Support' },
];

export const REQUEST_PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-50 text-blue-700' },
  { value: 'HIGH', label: 'High', color: 'bg-amber-50 text-amber-700' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-50 text-red-700' },
];

export const REQUEST_STATUSES = [
  { value: 'SUBMITTED', label: 'Submitted', color: 'bg-slate-100 text-slate-700' },
  { value: 'VERIFIED', label: 'Verified', color: 'bg-blue-50 text-blue-700' },
  { value: 'ASSIGNED', label: 'Assigned', color: 'bg-indigo-50 text-indigo-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-50 text-amber-700' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-rose-50 text-rose-700' },
];

export const DISASTER_TYPES = [
  { value: 'FLOOD', label: 'Floods' },
  { value: 'CYCLONE', label: 'Cyclone / Storm' },
  { value: 'EARTHQUAKE', label: 'Earthquake' },
  { value: 'FIRE', label: 'Fire Outbreak' },
  { value: 'LANDSLIDE', label: 'Landslide' },
  { value: 'TSUNAMI', label: 'Tsunami' },
  { value: 'EPIDEMIC', label: 'Health Outbreak' },
  { value: 'OTHER', label: 'Other' },
];

export const RESOURCE_CATEGORIES = [
  { value: 'WATER', label: 'Drinking Water' },
  { value: 'FOOD', label: 'Food Packages' },
  { value: 'MEDICINE', label: 'Medicines & First Aid' },
  { value: 'SHELTER_KIT', label: 'Shelter Materials' },
  { value: 'MEDICAL_EQUIPMENT', label: 'Medical Equipment' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'HYGIENE', label: 'Hygiene & Sanitization' },
  { value: 'OTHER', label: 'Other Supplies' },
];
