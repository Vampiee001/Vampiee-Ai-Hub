import { getAccessToken } from './firebaseAuth';

export interface GoogleContact {
  resourceName: string;
  etag: string;
  displayName: string;
  familyName?: string;
  givenName?: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
  organization?: string;
  jobTitle?: string;
  category?: 'client' | 'investor' | 'team' | 'partner' | 'other';
  notes?: string;
}

export const SAMPLE_CONTACTS: GoogleContact[] = [
  {
    resourceName: 'people/c101',
    etag: 'sample1',
    displayName: 'Elena Rostova',
    givenName: 'Elena',
    familyName: 'Rostova',
    email: 'elena.rostova@nexusfinance.io',
    phoneNumber: '+1 (555) 349-1029',
    organization: 'Nexus Financials',
    jobTitle: 'Chief Investment Officer',
    category: 'investor',
    notes: 'Primary stakeholder for Enterprise AI Hub project.',
  },
  {
    resourceName: 'people/c102',
    etag: 'sample2',
    displayName: 'Marcus Vance',
    givenName: 'Marcus',
    familyName: 'Vance',
    email: 'marcus@apexventures.capital',
    phoneNumber: '+1 (555) 892-4410',
    organization: 'Apex Ventures',
    jobTitle: 'Managing General Partner',
    category: 'investor',
    notes: 'Interested in AI Micro-SaaS seed round allocation.',
  },
  {
    resourceName: 'people/c103',
    etag: 'sample3',
    displayName: 'Dr. Sarah Lin',
    givenName: 'Sarah',
    familyName: 'Lin',
    email: 'sarah.lin@cloudscale.tech',
    phoneNumber: '+1 (555) 238-9041',
    organization: 'CloudScale Technologies',
    jobTitle: 'VP of Engineering',
    category: 'client',
    notes: 'Monthly advisory retainer client ($3,800/mo).',
  },
  {
    resourceName: 'people/c104',
    etag: 'sample4',
    displayName: 'Alex Thorne',
    givenName: 'Alex',
    familyName: 'Thorne',
    email: 'alex.thorne@quantumai.dev',
    phoneNumber: '+1 (555) 781-3320',
    organization: 'Quantum AI Labs',
    jobTitle: 'Lead AI Engineer',
    category: 'team',
    notes: 'Collaborates on multi-model routing benchmarks.',
  },
];

// Fetch connections from Google People API
export const fetchGoogleContacts = async (): Promise<GoogleContact[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google access token found. Please sign in with Google.');
  }

  const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos,organizations,userDefined&pageSize=100';

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch contacts: HTTP ${response.status}`);
  }

  const data = await response.json();
  const connections = data.connections || [];

  return connections.map((c: any) => {
    const name = c.names?.[0];
    const email = c.emailAddresses?.[0]?.value;
    const phone = c.phoneNumbers?.[0]?.value;
    const photo = c.photos?.[0]?.url;
    const org = c.organizations?.[0];

    return {
      resourceName: c.resourceName,
      etag: c.etag,
      displayName: name?.displayName || email || 'Unnamed Contact',
      givenName: name?.givenName,
      familyName: name?.familyName,
      email,
      phoneNumber: phone,
      photoUrl: photo,
      organization: org?.name,
      jobTitle: org?.title,
      category: 'client',
    };
  });
};

// Create contact in Google People API
export const createGoogleContact = async (contact: {
  givenName: string;
  familyName?: string;
  email?: string;
  phoneNumber?: string;
  organization?: string;
  jobTitle?: string;
}): Promise<GoogleContact> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google access token found. Please sign in with Google.');
  }

  const payload: any = {
    names: [
      {
        givenName: contact.givenName,
        familyName: contact.familyName || '',
      },
    ],
  };

  if (contact.email) {
    payload.emailAddresses = [{ value: contact.email, type: 'work' }];
  }
  if (contact.phoneNumber) {
    payload.phoneNumbers = [{ value: contact.phoneNumber, type: 'mobile' }];
  }
  if (contact.organization || contact.jobTitle) {
    payload.organizations = [
      {
        name: contact.organization || '',
        title: contact.jobTitle || '',
      },
    ];
  }

  const response = await fetch('https://people.googleapis.com/v1/people:createContact', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create contact: HTTP ${response.status}`);
  }

  const created = await response.json();
  const name = created.names?.[0];

  return {
    resourceName: created.resourceName,
    etag: created.etag,
    displayName: name?.displayName || contact.givenName,
    givenName: name?.givenName,
    familyName: name?.familyName,
    email: created.emailAddresses?.[0]?.value,
    phoneNumber: created.phoneNumbers?.[0]?.value,
    organization: created.organizations?.[0]?.name,
    jobTitle: created.organizations?.[0]?.title,
    category: 'client',
  };
};

// Delete contact from Google People API with explicit check
export const deleteGoogleContact = async (resourceName: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google access token found. Please sign in with Google.');
  }

  const response = await fetch(`https://people.googleapis.com/v1/${resourceName}:deleteContact`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete contact: HTTP ${response.status}`);
  }

  return true;
};
