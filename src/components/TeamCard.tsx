import { motion } from 'framer-motion';
import { Share2, Link2, Globe, Mail } from 'lucide-react';
import type { TeamMember } from '../types';

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

export default function TeamCard({ member, index }: TeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="h-full"
    >
      <div className="glass-card overflow-hidden group h-full flex flex-col justify-between">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden shrink-0 bg-[var(--bg-secondary)]">
          <img
            src={member.image?.trim() || member.profileImageUrl?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Social Links Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2 justify-center">
            {member.email && (
              <a href={`mailto:${member.email}`} className="p-2 rounded-lg bg-white/15 backdrop-blur-md text-white hover:bg-primary/40 transition-colors" aria-label={`Email ${member.name}`}>
                <Mail className="w-4 h-4" />
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/15 backdrop-blur-md text-white hover:bg-primary/40 transition-colors" aria-label={`${member.name}'s LinkedIn`}>
                <Link2 className="w-4 h-4" />
              </a>
            )}
            {member.github && (
              <a href={member.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/15 backdrop-blur-md text-white hover:bg-primary/40 transition-colors" aria-label={`${member.name}'s GitHub`}>
                <Share2 className="w-4 h-4" />
              </a>
            )}
            {member.instagram && (
              <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/15 backdrop-blur-md text-white hover:bg-primary/40 transition-colors" aria-label={`${member.name}'s Instagram`}>
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 text-center flex-1 flex flex-col justify-center">
          <h3 className="font-semibold text-[var(--text-primary)] font-heading line-clamp-1">{member.name}</h3>
          <p className="text-xs sm:text-sm text-primary font-medium mt-0.5 line-clamp-1">{member.role}</p>
          {member.department && (
            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{member.department}</p>
          )}
          {member.year && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{member.year}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
