import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Mail,
  Phone,
  Building,
  Briefcase,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  LogOut,
  Send,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  GoogleContact,
  SAMPLE_CONTACTS,
  fetchGoogleContacts,
  createGoogleContact,
  deleteGoogleContact,
} from '../services/contactsService';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  getAccessToken,
} from '../services/firebaseAuth';

interface ContactsViewProps {
  onAskVampieeOutreach: (prompt: string) => Promise<void>;
  isLoadingVampiee: boolean;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  onAskVampieeOutreach,
  isLoadingVampiee,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [contacts, setContacts] = useState<GoogleContact[]>(SAMPLE_CONTACTS);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'client' | 'investor' | 'team'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add Contact Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGivenName, setNewGivenName] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'client' | 'investor' | 'team'>('client');

  // Delete Confirmation Modal State (MANDATORY per Workspace guidelines)
  const [contactToDelete, setContactToDelete] = useState<GoogleContact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        loadContacts(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadContacts = async (token?: string) => {
    setIsLoadingContacts(true);
    setErrorMessage(null);
    try {
      const fetched = await fetchGoogleContacts();
      if (fetched && fetched.length > 0) {
        setContacts(fetched);
      } else {
        // If empty, keep sample contacts so UI is rich and functional
        setContacts(SAMPLE_CONTACTS);
      }
    } catch (err: any) {
      console.warn('Could not load live contacts:', err);
      // Fallback to sample contacts
      setContacts(SAMPLE_CONTACTS);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setSuccessMessage(`Connected Google Account: ${result.user.email}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadContacts(result.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setCurrentUser(null);
    setAccessToken(null);
    setContacts(SAMPLE_CONTACTS);
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGivenName.trim()) return;

    try {
      if (accessToken) {
        const created = await createGoogleContact({
          givenName: newGivenName.trim(),
          familyName: newFamilyName.trim(),
          email: newEmail.trim(),
          phoneNumber: newPhone.trim(),
          organization: newOrg.trim(),
          jobTitle: newTitle.trim(),
        });
        created.category = newCategory;
        setContacts((prev) => [created, ...prev]);
      } else {
        // Local state when previewing
        const localNew: GoogleContact = {
          resourceName: `people/local-${Date.now()}`,
          etag: 'local',
          displayName: `${newGivenName} ${newFamilyName}`.trim(),
          givenName: newGivenName,
          familyName: newFamilyName,
          email: newEmail,
          phoneNumber: newPhone,
          organization: newOrg,
          jobTitle: newTitle,
          category: newCategory,
        };
        setContacts((prev) => [localNew, ...prev]);
      }

      setSuccessMessage(`Contact ${newGivenName} added successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowAddModal(false);
      setNewGivenName('');
      setNewFamilyName('');
      setNewEmail('');
      setNewPhone('');
      setNewOrg('');
      setNewTitle('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create contact');
    }
  };

  // Explicit user confirmation modal executes deletion
  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);

    try {
      if (accessToken && !contactToDelete.resourceName.startsWith('people/local') && !contactToDelete.resourceName.startsWith('people/c10')) {
        await deleteGoogleContact(contactToDelete.resourceName);
      }
      setContacts((prev) => prev.filter((c) => c.resourceName !== contactToDelete.resourceName));
      setSuccessMessage(`Contact ${contactToDelete.displayName} deleted.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete contact');
    } finally {
      setIsDeleting(false);
      setContactToDelete(null);
    }
  };

  const handleDraftOutreach = (contact: GoogleContact) => {
    const prompt = `As Vampiee, draft an executive, high-converting outreach message to ${contact.displayName} (${contact.jobTitle || 'Executive'} at ${contact.organization || 'their firm'}). The purpose is to discuss partnership, AI workflow deployment, and monetization opportunities. Reference our $10k/mo velocity and enterprise AI capabilities.`;
    onAskVampieeOutreach(prompt);
  };

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'client' && (c.category === 'client' || !c.category)) ||
      c.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-[#0d0f17]/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Google Contacts Hub &amp; Network Sync
              {currentUser ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  CONNECTED: {currentUser.email}
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PREVIEW MODE
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Synchronize your Google Contacts network directly with Vampiee's work and client operations
            </p>
          </div>
        </div>

        {/* Right side Auth Controls */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadContacts()}
                disabled={isLoadingContacts}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs cursor-pointer"
                title="Refresh Google Contacts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingContacts ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            /* Official Google Sign-In button */
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Banner with Vampiee AI Contact Sync */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#121626] to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Vampiee Client &amp; Network Intelligence
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Vampiee can automatically craft personalized client updates, investor pitch memos, and schedule touchpoints using your real Google Contacts list.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const prompt = `As Vampiee, analyze my current active contacts (${contacts.map(c => `${c.displayName} at ${c.organization || 'firm'}`).join(', ')}). Suggest who I should follow up with this week to accelerate monetization and work projects.`;
                onAskVampieeOutreach(prompt);
              }}
              disabled={isLoadingVampiee}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Follow-Up Analysis</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts by name, email, company, or job title..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                categoryFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({contacts.length})
            </button>
            <button
              onClick={() => setCategoryFilter('client')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                categoryFilter === 'client' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setCategoryFilter('investor')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                categoryFilter === 'investor' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Investors
            </button>
            <button
              onClick={() => setCategoryFilter('team')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                categoryFilter === 'team' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Team
            </button>
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.resourceName}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {contact.photoUrl ? (
                    <img
                      src={contact.photoUrl}
                      alt={contact.displayName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                      {contact.displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {contact.displayName}
                      {contact.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {contact.category}
                        </span>
                      )}
                    </h4>
                    {(contact.jobTitle || contact.organization) && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>
                          {contact.jobTitle}
                          {contact.jobTitle && contact.organization ? ' at ' : ''}
                          {contact.organization}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Delete button (triggers explicit confirmation modal) */}
                <button
                  onClick={() => setContactToDelete(contact)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Delete contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Details & Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="space-y-1 text-slate-300">
                  {contact.email && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="w-3 h-3 text-blue-400" />
                      <a href={`mailto:${contact.email}`} className="hover:text-blue-400 transition-colors">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phoneNumber && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{contact.phoneNumber}</span>
                    </div>
                  )}
                </div>

                {/* AI Draft Email Button */}
                <button
                  onClick={() => handleDraftOutreach(contact)}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Draft AI Outreach</span>
                </button>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
              No contacts match your current filter.
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Add Contact to Google Network
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={newGivenName}
                    onChange={(e) => setNewGivenName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Doe"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Company / Org</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Managing Partner"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Network Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="client">Client</option>
                  <option value="investor">Investor / Capital</option>
                  <option value="team">Team Member / Engineer</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY User Confirmation Dialog for Destructive Delete */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Contact?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{contactToDelete.displayName}</strong> from your Google Contacts? This action cannot be undone.
            </p>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950 cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
