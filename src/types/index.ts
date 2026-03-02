export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  workTitle: string | null;
  company: string | null;
  warmth: number;
  notes: string | null;
  lastInteraction: string | null; // ISO string
  birthday: string | null; // ISO string
  linkedinUrl: string | null;
  createdAt: string;
  updatedAt: string;
  groups: Group[];
};

export type Group = {
  id: string;
  name: string;
  createdAt: string;
};

export type ContactListItem = Contact;

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export type ApiError = {
  error: string;
};
