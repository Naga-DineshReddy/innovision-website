import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, CheckCircle, Globe, Link2, MessageCircle, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import * as contactService from '../services/contact';
import { useSiteSettings } from '../hooks/useSiteSettings';

const socialLinks = [
  { icon: Globe, label: 'Instagram', href: '#', color: 'hover:text-pink-400' },
  { icon: Link2, label: 'LinkedIn', href: '#', color: 'hover:text-blue-400' },
  { icon: Share2, label: 'GitHub', href: '#', color: 'hover:text-gray-300' },
  { icon: MessageCircle, label: 'Twitter', href: '#', color: 'hover:text-sky-400' },
];

export default function Contact() {
  const settings = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await contactService.submitContactMessage(form);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="hero-py relative overflow-hidden grid-pattern">
        <div className="absolute bottom-0 right-0 w-96 md:w-[500px] h-96 md:h-[500px] bg-primary/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="text-primary font-semibold text-xs sm:text-sm tracking-wider uppercase mb-3 sm:mb-4">
              Contact
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[var(--text-primary)] mb-5 sm:mb-6 tracking-tight">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Have questions, ideas for collaboration, or want to partner with InnoVision? Connect with our team directly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-py border-t border-[var(--glass-border)]">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-bold font-heading text-[var(--text-primary)] mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="glass-card p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Email</p>
                        <a
                          href={`mailto:${settings.contactEmail}`}
                          className="text-sm font-medium text-[var(--text-primary)] hover:text-primary transition-colors truncate block"
                        >
                          {settings.contactEmail}
                        </a>
                      </div>
                    </div>

                    <div className="glass-card p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Phone</p>
                        <a
                          href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`}
                          className="text-sm font-medium text-[var(--text-primary)] hover:text-primary transition-colors block"
                        >
                          {settings.contactPhone}
                        </a>
                      </div>
                    </div>

                    <div className="glass-card p-4 flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Address</p>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                          {settings.contactAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-3">Follow InnoVision</h3>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map(social => (
                      <a
                        key={social.label}
                        href={social.href}
                        aria-label={social.label}
                        className={`w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-secondary)] ${social.color} hover:border-primary/40 hover:bg-primary/5 transition-all duration-200`}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8"
              >
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold font-heading text-[var(--text-primary)] mb-2">Message Sent!</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-md mx-auto">
                      Thank you for reaching out. We have received your message and will respond promptly.
                    </p>
                    <Button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                      <h3 className="text-xl font-bold font-heading text-[var(--text-primary)] mb-1">
                        Send us a message
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                        Fill out the details below and we'll get back to you shortly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Alex Smith"
                        error={errors.name}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@college.edu"
                        error={errors.email}
                      />
                    </div>
                    <Input
                      label="Subject"
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Workshop Collaboration"
                      error={errors.subject}
                    />
                    <Textarea
                      label="Message"
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Write your message here..."
                      error={errors.message}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      icon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    >
                      {submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

