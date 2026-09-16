import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  RefreshCw, Database, Shield, Cloud, Video, Mail, Phone,
  MapPin, Upload, Trash2, RotateCcw, Check, Save,
  Film, AlertCircle, Eye, EyeOff, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import ImageUpload from '../../components/ui/ImageUpload';
import {
  getSiteSettings,
  fetchSiteSettings,
  updateSiteSettings,
  type SiteSettings,
} from '../../services/siteSettings';
import {
  saveVideoBlob,
  getVideoBlob,
  deleteVideoBlob,
} from '../../services/videoStorage';

export default function Settings() {
  const { adminProfile, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'video' | 'contact' | 'system'>(
    tabParam === 'contact' ? 'contact' : tabParam === 'system' ? 'system' : 'video'
  );

  // Settings State
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [contactAddress, setContactAddress] = useState(settings.contactAddress);

  // Video State
  const [videoTitle, setVideoTitle] = useState(settings.videoTitle);
  const [videoSubtitle, setVideoSubtitle] = useState(settings.videoSubtitle);
  const [videoUrl, setVideoUrl] = useState(settings.videoUrl);
  const [videoPoster, setVideoPoster] = useState(settings.videoPoster);
  const [videoEnabled, setVideoEnabled] = useState(settings.videoEnabled);
  const [videoSourceType, setVideoSourceType] = useState(settings.videoSourceType);

  // Local Upload & Player State
  const [uploadedVideoName, setUploadedVideoName] = useState(settings.uploadedVideoName || '');
  const [uploadedVideoSize, setUploadedVideoSize] = useState(settings.uploadedVideoSize || 0);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string>('');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Load fresh site settings from backend on mount
  useEffect(() => {
    fetchSiteSettings().then((fresh) => {
      setSettings(fresh);
      setContactEmail(fresh.contactEmail);
      setContactPhone(fresh.contactPhone);
      setContactAddress(fresh.contactAddress);
      setVideoTitle(fresh.videoTitle);
      setVideoSubtitle(fresh.videoSubtitle);
      setVideoUrl(fresh.videoUrl);
      setVideoPoster(fresh.videoPoster);
      setVideoEnabled(fresh.videoEnabled);
      setVideoSourceType(fresh.videoSourceType);
      if (fresh.uploadedVideoName) setUploadedVideoName(fresh.uploadedVideoName);
      if (fresh.uploadedVideoSize) setUploadedVideoSize(fresh.uploadedVideoSize);
    });
  }, []);

  // Synchronize tab selection with URL
  const switchTab = (tab: 'video' | 'contact' | 'system') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Load preview video when source changes
  useEffect(() => {
    let objUrl: string | null = null;

    if (videoSourceType === 'uploaded') {
      getVideoBlob().then((record) => {
        if (record?.blob) {
          objUrl = URL.createObjectURL(record.blob);
          setPreviewVideoUrl(objUrl);
          setUploadedVideoName(record.name);
          setUploadedVideoSize(record.size);
        } else {
          setPreviewVideoUrl('');
        }
      });
    } else if (videoSourceType === 'url') {
      setPreviewVideoUrl(videoUrl);
    } else {
      setPreviewVideoUrl('/videos/innovision-promo.mp4?v=2');
    }

    return () => {
      if (objUrl) {
        URL.revokeObjectURL(objUrl);
      }
    };
  }, [videoSourceType, videoUrl]);

  // Handle uploading video from local files / documents
  const handleVideoFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file (MP4, WebM, QuickTime)');
      return;
    }

    // 200MB limit for browser indexedDB storage
    if (file.size > 250 * 1024 * 1024) {
      toast.error('Video size exceeds 250MB limit. Please choose a smaller file.');
      return;
    }

    setIsProcessingVideo(true);
    try {
      await saveVideoBlob(file, file.name);

      const objUrl = URL.createObjectURL(file);
      setPreviewVideoUrl(objUrl);
      setUploadedVideoName(file.name);
      setUploadedVideoSize(file.size);
      setVideoSourceType('uploaded');

      // Auto update site settings
      const updated = await updateSiteSettings({
        videoSourceType: 'uploaded',
        hasCustomUploadedVideo: true,
        uploadedVideoName: file.name,
        uploadedVideoSize: file.size,
        videoEnabled: true,
      });
      setSettings(updated);
      setVideoEnabled(true);

      toast.success(`Video "${file.name}" added successfully from documents!`);
    } catch (err) {
      console.error('Failed to save video:', err);
      toast.error('Failed to process video file.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingVideo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleVideoFile(file);
  };

  // Remove the current video
  const handleRemoveVideo = async () => {
    setIsSaving(true);
    try {
      await deleteVideoBlob();
      setPreviewVideoUrl('');
      setUploadedVideoName('');
      setUploadedVideoSize(0);
      setVideoSourceType('default');
      setVideoEnabled(false);

      const updated = await updateSiteSettings({
        videoEnabled: false,
        videoSourceType: 'default',
        hasCustomUploadedVideo: false,
        uploadedVideoName: '',
        uploadedVideoSize: 0,
      });
      setSettings(updated);

      toast.success('Video removed and hidden from the homepage.');
    } catch (err) {
      console.error('Error removing video:', err);
      toast.error('Failed to remove video.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default InnoVision promo video
  const handleResetToDefaultVideo = async () => {
    setIsSaving(true);
    try {
      await deleteVideoBlob();
      setVideoSourceType('default');
      setVideoEnabled(true);
      setVideoUrl('/videos/innovision-promo.mp4?v=2');
      setVideoPoster('/videos/innovision-promo-thumb.png?v=2');
      setVideoTitle('Experience InnoVision');
      setVideoSubtitle(
        'Watch our highlight reel and discover what makes InnoVision the most exciting tech community on campus.'
      );
      setUploadedVideoName('');
      setUploadedVideoSize(0);
      setPreviewVideoUrl('/videos/innovision-promo.mp4?v=2');

      const updated = await updateSiteSettings({
        videoEnabled: true,
        videoSourceType: 'default',
        videoUrl: '/videos/innovision-promo.mp4?v=2',
        videoPoster: '/videos/innovision-promo-thumb.png?v=2',
        videoTitle: 'Experience InnoVision',
        videoSubtitle:
          'Watch our highlight reel and discover what makes InnoVision the most exciting tech community on campus.',
        hasCustomUploadedVideo: false,
        uploadedVideoName: '',
        uploadedVideoSize: 0,
      });
      setSettings(updated);

      toast.success('Reset to original InnoVision promo video.');
    } catch (err) {
      console.error('Error resetting video:', err);
      toast.error('Failed to reset video.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Video Details (Title, Subtitle, Visibility, Poster)
  const handleSaveVideoSettings = async () => {
    setIsSaving(true);
    try {
      const updated = await updateSiteSettings({
        videoEnabled,
        videoTitle,
        videoSubtitle,
        videoPoster,
        videoSourceType,
        videoUrl,
      });
      setSettings(updated);
      toast.success('Homepage video settings saved successfully!');
    } catch (err) {
      console.error('Failed to save video settings:', err);
      toast.error('Saved locally, but failed to sync to database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Contact Info
  const handleSaveContactSettings = async () => {
    if (!contactEmail.trim() || !/\S+@\S+\.\S+/.test(contactEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!contactPhone.trim()) {
      toast.error('Please enter a contact phone number');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateSiteSettings({
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        contactAddress: contactAddress.trim(),
      });
      setSettings(updated);
      toast.success('Contact information updated successfully! Changes are live on Contact page & Footer.');
    } catch (err) {
      console.error('Failed to save contact settings:', err);
      toast.error('Saved locally, but database sync failed. Please ensure the migration SQL is applied.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Site Settings</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Manage homepage video, contact details, and application configuration.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--glass-border)] pb-2">
        <button
          onClick={() => switchTab('video')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'video'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
          }`}
        >
          <Film className="w-4 h-4" />
          Homepage Video
        </button>
        <button
          onClick={() => switchTab('contact')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'contact'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
          }`}
        >
          <Mail className="w-4 h-4" />
          Contact Details
        </button>
        <button
          onClick={() => switchTab('system')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Account & System
        </button>
      </div>

      {/* TAB 1: HOMEPAGE VIDEO */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Video Manager (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visibility Toggle Card */}
            <div className="glass-card p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-base text-[var(--text-primary)]">
                    Homepage Video Section
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      videoEnabled
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {videoEnabled ? 'Active on Homepage' : 'Hidden / Removed'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Control whether the "Experience InnoVision" video section is displayed on the main page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-medium ${
                  videoEnabled
                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                    : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                }`}
              >
                {videoEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {videoEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Video Upload Dropzone */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">
                    Add / Replace Video from Documents
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Select any MP4, WebM or QuickTime video file directly from your computer.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  icon={<Upload className="w-4 h-4" />}
                  disabled={isProcessingVideo}
                >
                  Browse Documents
                </Button>
              </div>

              <div
                onDrop={handleVideoDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingVideo(true);
                }}
                onDragLeave={() => setIsDraggingVideo(false)}
                onClick={() => !isProcessingVideo && videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDraggingVideo
                    ? 'border-primary bg-primary/10 scale-[0.99]'
                    : 'border-[var(--glass-border)] hover:border-primary/50 hover:bg-[var(--bg-secondary)]'
                } ${isProcessingVideo ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isProcessingVideo ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Processing video file and saving to media storage...
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">Please wait a moment</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Film className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {isDraggingVideo ? 'Drop video file here' : 'Choose video from Documents / Computer'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        MP4, WebM, MOV supported • Up to 250MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoFile(file);
                  if (videoInputRef.current) videoInputRef.current.value = '';
                }}
              />
            </div>

            {/* Video Section Info Form */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-base text-[var(--text-primary)]">Section Titles & Poster</h3>

              <Input
                label="Section Heading"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Experience InnoVision"
              />

              <Textarea
                label="Section Description"
                value={videoSubtitle}
                onChange={(e) => setVideoSubtitle(e.target.value)}
                placeholder="Watch our highlight reel and discover what makes InnoVision..."
              />

              {/* Poster Thumbnail Upload */}
              <ImageUpload
                label="Video Poster Thumbnail"
                value={videoPoster}
                onChange={(url) => setVideoPoster(url)}
                bucket="association-assets"
              />

              {/* Or Web URL */}
              <div className="pt-2 border-t border-[var(--glass-border)]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Or Stream via Custom URL (Optional)
                  </label>
                  {videoSourceType === 'url' && (
                    <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                      Using Custom URL
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      if (e.target.value) setVideoSourceType('url');
                    }}
                    placeholder="https://example.com/promo.mp4"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (!videoUrl) return;
                      setVideoSourceType('url');
                      setPreviewVideoUrl(videoUrl);
                      toast.success('Switched to custom video URL');
                    }}
                  >
                    Apply URL
                  </Button>
                </div>
              </div>

              {/* Save & Reset Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--glass-border)]">
                <Button
                  onClick={handleSaveVideoSettings}
                  disabled={isSaving}
                  icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  Save Video Settings
                </Button>

                <Button
                  variant="danger"
                  onClick={handleRemoveVideo}
                  disabled={isSaving}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Remove Video
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleResetToDefaultVideo}
                  disabled={isSaving}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset to Original Promo
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Video Player Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  Active Video Preview
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize font-medium">
                  {videoSourceType === 'uploaded'
                    ? 'Uploaded File'
                    : videoSourceType === 'url'
                    ? 'Custom URL'
                    : 'Default Promo'}
                </span>
              </div>

              {/* Video Player */}
              {previewVideoUrl && previewVideoUrl.trim() ? (
                <div className="rounded-2xl overflow-hidden bg-black aspect-video relative border border-[var(--glass-border)]">
                  <video
                    ref={videoPlayerRef}
                    key={previewVideoUrl}
                    src={previewVideoUrl.trim()}
                    poster={videoPoster?.trim() || '/videos/innovision-promo-thumb.png?v=2'}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-[var(--bg-secondary)] border border-dashed border-[var(--glass-border)] flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                  <p className="text-sm font-medium text-[var(--text-secondary)]">No active video</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Upload a video from documents or apply a URL
                  </p>
                </div>
              )}

              {/* Status Details */}
              <div className="space-y-2 text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--glass-border)]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Homepage Visibility:</span>
                  <span className={videoEnabled ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                    {videoEnabled ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                {uploadedVideoName && videoSourceType === 'uploaded' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">File Name:</span>
                      <span className="text-[var(--text-primary)] font-medium truncate max-w-[180px]">
                        {uploadedVideoName}
                      </span>
                    </div>
                    {uploadedVideoSize > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">File Size:</span>
                        <span className="text-[var(--text-primary)] font-medium">
                          {formatFileSize(uploadedVideoSize)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Title:</span>
                  <span className="text-[var(--text-primary)] font-medium truncate max-w-[180px]">
                    {videoTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACT DETAILS */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Edit Form (7 cols) */}
          <div className="lg:col-span-7 glass-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-1">
                Contact Page & Footer Details
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Update the official Gmail address, phone number, and campus location. Changes will update on the Contact page and Footer immediately.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Contact Gmail / Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="innovision@college.edu or dinesh@gmail.com"
                icon={<Mail className="w-4 h-4 text-primary" />}
              />

              <Input
                label="Contact Phone Number"
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4 text-primary" />}
              />

              <Textarea
                label="Campus Address / Location"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="Department of AI & Data Science, Main Campus, Block A, College of Engineering"
              />
            </div>

            <div className="pt-3 border-t border-[var(--glass-border)] flex items-center gap-3">
              <Button
                onClick={handleSaveContactSettings}
                disabled={isSaving}
                icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                Save Contact Information
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setContactEmail('innovision@college.edu');
                  setContactPhone('+91 98765 43210');
                  setContactAddress('Department of AI & Data Science,\nMain Campus, Block A, College of Engineering');
                }}
              >
                Restore Defaults
              </Button>
            </div>
          </div>

          {/* Live Preview Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Live Contact Page Preview
                </h3>
                <span className="text-[10px] uppercase font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                  Real-time
                </span>
              </div>

              <div className="space-y-3">
                {/* Email Preview */}
                <div className="glass-card p-3.5 flex items-center gap-3.5 bg-[var(--bg-secondary)]">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Email
                    </p>
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {contactEmail || 'innovision@college.edu'}
                    </p>
                  </div>
                </div>

                {/* Phone Preview */}
                <div className="glass-card p-3.5 flex items-center gap-3.5 bg-[var(--bg-secondary)]">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Phone
                    </p>
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {contactPhone || '+91 98765 43210'}
                    </p>
                  </div>
                </div>

                {/* Address Preview */}
                <div className="glass-card p-3.5 flex items-start gap-3.5 bg-[var(--bg-secondary)]">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Address
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                      {contactAddress ||
                        'Department of AI & Data Science,\nMain Campus, Block A, College of Engineering'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT & SYSTEM */}
      {activeTab === 'system' && (
        <div className="max-w-2xl space-y-6">
          {/* Admin Profile */}
          {adminProfile && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-4">Admin Profile</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Name</span>
                  <span className="text-[var(--text-primary)] font-medium">{adminProfile.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Email</span>
                  <span className="text-[var(--text-primary)] font-medium">{adminProfile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Role</span>
                  <span className="text-[var(--text-primary)] font-medium capitalize">{adminProfile.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* App Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-4">Application Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Application</span>
                <span className="text-[var(--text-primary)] font-medium">InnoVision Admin Portal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Version</span>
                <span className="text-[var(--text-primary)] font-medium">2.1.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Data Storage</span>
                <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                  <Cloud className="w-4 h-4 text-primary" /> Supabase Cloud + IndexedDB Media
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Authentication</span>
                <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                  <Shield className="w-4 h-4 text-green-400" /> Supabase Auth
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Database</span>
                <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                  <Database className="w-4 h-4 text-blue-400" /> PostgreSQL + RLS
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-2">Actions</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Manage your session and reset system caches.
            </p>
            <div className="space-y-3">
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                icon={<RefreshCw className="w-4 h-4" />}
                fullWidth
              >
                Refresh Application
              </Button>
              <Button
                variant="danger"
                onClick={signOut}
                fullWidth
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
