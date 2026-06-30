import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  DollarSign,
  MapPin,
  ClipboardList,
  Loader2,
  FileText,
  Download,
  Upload,
} from 'lucide-react';
import { useTrackerStore } from '@/store/trackerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'wishlist', title: 'Wishlist', color: 'border-t-accent-cyan bg-accent-cyan/5 text-accent-cyan' },
  { id: 'applied', title: 'Applied', color: 'border-t-brand-400 bg-brand-400/5 text-brand-400' },
  { id: 'interviewing', title: 'Interviewing', color: 'border-t-accent-purple bg-accent-purple/5 text-accent-purple' },
  { id: 'offered', title: 'Offered', color: 'border-t-accent-emerald bg-accent-emerald/5 text-accent-emerald' },
  { id: 'rejected', title: 'Rejected', color: 'border-t-red-400 bg-red-400/5 text-red-400' },
];

export default function Tracker() {
  const {
    applications,
    isLoading,
    fetchApplications,
    addApplication,
    updateStatus,
    updateDetails,
    deleteApplication,
  } = useTrackerStore();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Form states
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    status: 'wishlist',
    notes: '',
    salary: '',
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company) {
      toast.error('Title and Company are required');
      return;
    }
    try {
      await addApplication(form);
      toast.success('Application tracked!');
      setAddOpen(false);
      setForm({ title: '', company: '', location: '', status: 'wishlist', notes: '', salary: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to add application');
    }
  };

  const handleEditClick = (app) => {
    setSelectedApp(app);
    setForm({
      title: app.title,
      company: app.company,
      location: app.location || '',
      status: app.status,
      notes: app.notes || '',
      salary: app.salary || '',
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDetails(selectedApp._id, form);
      toast.success('Application updated!');
      setEditOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update application');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this application?')) return;
    try {
      await deleteApplication(id);
      toast.success('Application removed');
      setEditOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const moveStatus = async (app, direction) => {
    const currentIndex = COLUMNS.findIndex((col) => col.id === app.status);
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const nextColId = COLUMNS[newIndex].id;
      try {
        await updateStatus(app._id, nextColId);
        toast.success(`Moved to ${COLUMNS[newIndex].title}`);
      } catch (err) {
        toast.error(err.message || 'Move failed');
      }
    }
  };

  const fileInputRef = useRef(null);

  const handleExportCSV = () => {
    if (applications.length === 0) {
      toast.error('No applications to export');
      return;
    }
    const headers = ['Title', 'Company', 'Location', 'Salary', 'Status', 'Notes', 'Date'];
    const rows = applications.map(app => [
      `"${(app.title || '').replace(/"/g, '""')}"`,
      `"${(app.company || '').replace(/"/g, '""')}"`,
      `"${(app.location || '').replace(/"/g, '""')}"`,
      `"${(app.salary || '').replace(/"/g, '""')}"`,
      `"${(app.status || '').replace(/"/g, '""')}"`,
      `"${(app.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(app.createdAt || Date.now()).toLocaleDateString()}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hirewave_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Applications exported successfully!');
  };

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;

      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length <= 1) {
        toast.error('CSV file is empty or invalid');
        return;
      }

      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
      const titleIndex = headers.indexOf('title');
      const companyIndex = headers.indexOf('company');
      const locationIndex = headers.indexOf('location');
      const salaryIndex = headers.indexOf('salary');
      const statusIndex = headers.indexOf('status');
      const notesIndex = headers.indexOf('notes');

      if (titleIndex === -1 || companyIndex === -1) {
        toast.error('CSV must contain at least "Title" and "Company" columns');
        return;
      }

      let importedCount = 0;
      let failedCount = 0;
      const loadToastId = toast.loading('Importing applications from CSV...');

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 2) continue;

        const title = values[titleIndex];
        const company = values[companyIndex];
        if (!title || !company) {
          failedCount++;
          continue;
        }

        const location = locationIndex !== -1 ? values[locationIndex] : '';
        const salary = salaryIndex !== -1 ? values[salaryIndex] : '';
        let status = statusIndex !== -1 ? values[statusIndex].toLowerCase() : 'wishlist';

        const validStatuses = ['wishlist', 'applied', 'interviewing', 'offered', 'rejected'];
        if (!validStatuses.includes(status)) {
          status = 'wishlist';
        }

        const notes = notesIndex !== -1 ? values[notesIndex] : '';

        try {
          await addApplication({ title, company, location, salary, status, notes });
          importedCount++;
        } catch {
          failedCount++;
        }
      }

      toast.dismiss(loadToastId);
      if (importedCount > 0) {
        toast.success(`Successfully imported ${importedCount} applications!`);
        fetchApplications();
      }
      if (failedCount > 0) {
        toast.error(`Failed to import ${failedCount} rows due to invalid data.`);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-page dark:bg-page-dark transition-colors duration-500 ease-smooth">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-brand-400" />
              Application Tracker
            </h1>
            <p className="text-muted-foreground text-sm">Visualize and manage your pipeline of job applications</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportCSV}
              accept=".csv"
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1.5" />
              Import CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
            <Button variant="glow" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Application
            </Button>
          </div>
        </div>

        {/* Board Columns Grid */}
        {isLoading && applications.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            {COLUMNS.map((column) => {
              const colApps = applications.filter((app) => app.status === column.id);

              return (
                <div
                  key={column.id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card dark:bg-zinc-900 overflow-hidden flex flex-col max-h-[80vh]"
                >
                  {/* Column Header */}
                  <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 border-t-2 ${column.color} flex justify-between items-center`}>
                    <h3 className="font-semibold font-display text-sm text-zinc-900 dark:text-white">{column.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 text-muted-foreground font-semibold">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Column Content */}
                  <div className="p-3 space-y-3 overflow-y-auto min-h-[40vh] flex-1 max-h-[65vh] scrollbar-thin">
                    <AnimatePresence mode="popLayout">
                      {colApps.map((app) => (
                        <motion.div
                          key={app._id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/20 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors relative group card-glow cursor-pointer"
                          onClick={() => handleEditClick(app)}
                        >
                          {/* Title & Company */}
                          <h4 className="font-semibold text-zinc-900 dark:text-white text-sm truncate">{app.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                            <Briefcase size={10} />
                            {app.company}
                          </p>

                          {/* Extra info badges */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {app.location && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-cyan px-1.5 py-0.5 rounded bg-accent-cyan/5">
                                <MapPin size={9} />
                                {app.location}
                              </span>
                            )}
                            {app.salary && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-emerald px-1.5 py-0.5 rounded bg-accent-emerald/5">
                                <DollarSign size={9} />
                                {app.salary}
                              </span>
                            )}
                          </div>

                          {/* Actions / Move buttons (stop propagation so card click doesn't trigger) */}
                          <div className="flex items-center justify-between mt-4 pt-2 border-t border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStatus(app, -1);
                              }}
                              disabled={column.id === 'wishlist'}
                              className="p-1 hover:text-white disabled:opacity-30 disabled:pointer-events-none text-muted-foreground"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                              Shift Card
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveStatus(app, 1);
                              }}
                              disabled={column.id === 'rejected'}
                              className="p-1 hover:text-white disabled:opacity-30 disabled:pointer-events-none text-muted-foreground"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {colApps.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground/60 italic">
                        Empty column
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dialog: Add Application */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="gradient-text font-display">Track Application</DialogTitle>
              <DialogDescription>Add a new job card to your search pipeline</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Job Title *</label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Lead Frontend Engineer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Company *</label>
                <Input
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Google"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Location</label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Bangalore / Remote"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Salary</label>
                  <Input
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="e.g. 18 LPA"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Pipeline Stage</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Application Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Referral name, apply date, next follow up..."
                  rows={3}
                  className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                />
              </div>

              <Button type="submit" variant="glow" className="w-full mt-2">
                Create Card
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog: Edit Details */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="gradient-text font-display">Edit Card</DialogTitle>
              <DialogDescription>Modify application details or archive the listing</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="space-y-4 mt-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Job Title</label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Company</label>
                <Input
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Location</label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Salary</label>
                  <Input
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Pipeline Stage</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Application Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleDelete(selectedApp._id)}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Remove Card
                </Button>
                <Button type="submit" variant="glow" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
