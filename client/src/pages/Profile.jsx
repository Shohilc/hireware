import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, FileText, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, fetchUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    experience: user?.profile?.experience || '',
    skills: user?.profile?.skills?.join(', ') || '',
  });

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/user/profile', {
        name: form.name,
        profile: {
          bio: form.bio,
          location: form.location,
          experience: form.experience,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        },
      });
      await fetchUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-zinc-900 dark:text-white mb-1">Profile</h1>
          <p className="text-muted-foreground text-sm mb-8">Manage your HireWave profile</p>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl bg-card dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-2xl font-bold text-white">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p className="text-zinc-900 dark:text-white font-semibold">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField icon={User} label="Full Name">
              <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Your name" />
            </FormField>

            <FormField icon={FileText} label="Bio">
              <textarea
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="A short bio about yourself..."
                rows={3}
                className="flex w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 resize-none"
              />
            </FormField>

            <FormField icon={MapPin} label="Location">
              <Input value={form.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="e.g., Bangalore, India" />
            </FormField>

            <FormField icon={User} label="Experience">
              <Input value={form.experience} onChange={(e) => handleChange('experience', e.target.value)} placeholder="e.g., 3 years" />
            </FormField>

            <FormField icon={User} label="Skills (comma-separated)">
              <Input value={form.skills} onChange={(e) => handleChange('skills', e.target.value)} placeholder="React, Node.js, Python, AWS" />
            </FormField>

            <Button type="submit" variant="glow" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function FormField({ icon: Icon, label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {children}
    </div>
  );
}
