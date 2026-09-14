import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Event, RegistrationMember } from '../types';
import { Input, Select } from './ui/Input';
import Button from './ui/Button';
import * as registrationService from '../services/registrations';

interface RegistrationFormProps {
  event: Event;
  onCancel: () => void;
}

const emptyMember: RegistrationMember = {
  fullName: '',
  rollNumber: '',
  email: '',
  phone: '',
  department: 'AI & Data Science',
  year: '1st Year',
};

const departments = [
  { value: 'AI & Data Science', label: 'AI & Data Science' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Mechanical', label: 'Mechanical' },
  { value: 'Other', label: 'Other' },
];

const years = [
  { value: '1st Year', label: '1st Year' },
  { value: '2nd Year', label: '2nd Year' },
  { value: '3rd Year', label: '3rd Year' },
  { value: '4th Year', label: '4th Year' },
];

export default function RegistrationForm({ event, onCancel }: RegistrationFormProps) {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<RegistrationMember[]>([{ ...emptyMember }]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regId, setRegId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMember = () => {
    if (members.length < event.maxTeamSize) {
      setMembers([...members, { ...emptyMember }]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > event.minTeamSize) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: keyof RegistrationMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!teamName.trim() && event.maxTeamSize > 1) {
      newErrors.teamName = 'Team name is required';
    }

    members.forEach((m, i) => {
      if (!m.fullName.trim()) newErrors[`member-${i}-name`] = 'Name is required';
      if (!m.rollNumber.trim()) newErrors[`member-${i}-roll`] = 'Roll number is required';
      if (!m.email.trim() || !/\S+@\S+\.\S+/.test(m.email)) newErrors[`member-${i}-email`] = 'Valid email is required';
      if (!m.phone.trim() || m.phone.length < 10) newErrors[`member-${i}-phone`] = 'Valid phone number is required';
    });

    if (members.length < event.minTeamSize) {
      newErrors.general = `Minimum ${event.minTeamSize} team member(s) required`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const finalTeamName = event.maxTeamSize === 1 ? `Solo — ${members[0].fullName}` : teamName;

      const result = await registrationService.createRegistration(
        event.id,
        finalTeamName,
        members
      );

      if (!result.success) {
        toast.error(result.error || 'Registration failed');
        return;
      }

      setRegId(result.registrationId || '');
      setSubmitted(true);
      toast.success('Registration successful!');
    } catch (err) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold font-heading text-[var(--text-primary)] mb-2">
          Registration Successful!
        </h3>
        <p className="text-[var(--text-secondary)] mb-6">
          Your registration for <strong>{event.name}</strong> has been confirmed.
        </p>
        <div className="glass-card inline-block px-6 py-4 mb-6">
          <p className="text-sm text-[var(--text-muted)] mb-1">Your Registration ID</p>
          <p className="text-xl font-bold font-heading text-primary">{regId}</p>
        </div>
        <div>
          <Button onClick={onCancel}>Close</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card p-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Registering for: <strong className="text-[var(--text-primary)]">{event.name}</strong>
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Team size: {event.minTeamSize === event.maxTeamSize ? event.minTeamSize : `${event.minTeamSize}–${event.maxTeamSize}`} member(s)
        </p>
      </div>

      {event.maxTeamSize > 1 && (
        <Input
          label="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter your team name"
          error={errors.teamName}
        />
      )}

      {members.map((member, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              {event.maxTeamSize === 1 ? 'Your Details' : `Member ${i + 1}`}
            </h4>
            {members.length > event.minTeamSize && (
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label={`Remove member ${i + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={member.fullName}
              onChange={(e) => updateMember(i, 'fullName', e.target.value)}
              placeholder="Enter full name"
              error={errors[`member-${i}-name`]}
            />
            <Input
              label="Roll Number"
              value={member.rollNumber}
              onChange={(e) => updateMember(i, 'rollNumber', e.target.value)}
              placeholder="e.g., 21AID045"
              error={errors[`member-${i}-roll`]}
            />
            <Input
              label="Email"
              type="email"
              value={member.email}
              onChange={(e) => updateMember(i, 'email', e.target.value)}
              placeholder="student@college.edu"
              error={errors[`member-${i}-email`]}
            />
            <Input
              label="Phone"
              type="tel"
              value={member.phone}
              onChange={(e) => updateMember(i, 'phone', e.target.value)}
              placeholder="10-digit phone number"
              error={errors[`member-${i}-phone`]}
            />
            <Select
              label="Department"
              value={member.department}
              onChange={(e) => updateMember(i, 'department', (e.target as HTMLSelectElement).value)}
              options={departments}
            />
            <Select
              label="Year"
              value={member.year}
              onChange={(e) => updateMember(i, 'year', (e.target as HTMLSelectElement).value)}
              options={years}
            />
          </div>
        </motion.div>
      ))}

      {members.length < event.maxTeamSize && (
        <Button type="button" variant="secondary" onClick={addMember} icon={<UserPlus className="w-4 h-4" />} fullWidth>
          Add Team Member
        </Button>
      )}

      {errors.general && (
        <p className="text-sm text-red-400 text-center">{errors.general}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Registering...
            </span>
          ) : (
            'Register Now'
          )}
        </Button>
      </div>
    </form>
  );
}
