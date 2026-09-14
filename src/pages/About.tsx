import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Users, Award, Briefcase, Heart, Target, Eye } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';

const cards = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We foster creative thinking and encourage students to explore unconventional solutions to real-world problems.',
  },
  {
    icon: TrendingUp,
    title: 'Technical Growth',
    description: 'Through workshops, hackathons, and bootcamps, we provide hands-on experience with cutting-edge technologies.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'We bring together students from diverse backgrounds to collaborate, share ideas, and build impactful projects.',
  },
  {
    icon: Award,
    title: 'Leadership',
    description: 'Our members develop leadership skills by organizing events, mentoring peers, and managing technical projects.',
  },
  {
    icon: Briefcase,
    title: 'Industry Exposure',
    description: 'We connect students with industry professionals through seminars, tech talks, and networking events.',
  },
  {
    icon: Heart,
    title: 'Community',
    description: 'We are more than an association — we are a family of passionate technologists supporting each other\'s growth.',
  },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="hero-py relative overflow-hidden grid-pattern">
        <div className="absolute top-0 right-0 w-96 md:w-[500px] h-96 md:h-[500px] bg-primary/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <p className="text-primary font-semibold text-xs sm:text-sm tracking-wider uppercase mb-3 sm:mb-4">
              About Us
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[var(--text-primary)] mb-5 sm:mb-6 tracking-tight">
              Where <span className="gradient-text">Intelligence</span> Meets Innovation
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              InnoVision is the official student association of the Department of Artificial Intelligence & Data Science. Founded with the vision of empowering students to explore, innovate, and lead in the world of AI and emerging technologies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Overview */}
      <section className="section-py border-t border-[var(--glass-border)]">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[var(--text-primary)] mb-5">
                What is <span className="gradient-text">InnoVision</span>?
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                <p>
                  InnoVision is a student-driven initiative dedicated to bridging the gap between academic learning and industry-ready skills in Artificial Intelligence and Data Science.
                </p>
                <p>
                  We organize hackathons, workshops, tech talks, competitions, and bootcamps that provide students with hands-on experience in cutting-edge technologies. Our events are designed to challenge, inspire, and prepare students for the rapidly evolving tech landscape.
                </p>
                <p>
                  From freshers discovering their passion for tech to seniors building their portfolios, InnoVision offers something for everyone at every stage of their journey.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 relative"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="glass-card p-6 text-center sm:text-left flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 sm:mb-3">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-lg text-[var(--text-primary)] mb-1">Our Mission</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-normal">
                      To empower students with practical skills, innovative mindsets, and research rigor in AI & Data Science.
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 text-center sm:text-left flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0 sm:mb-3">
                    <Eye className="w-6 h-6 text-secondary-light" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-lg text-[var(--text-primary)] mb-1">Our Vision</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-normal">
                      To be a premier student tech community recognized for fostering next-generation leaders and breakthroughs.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why InnoVision */}
      <section className="section-py relative bg-[var(--bg-secondary)]/30 border-t border-[var(--glass-border)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="section-container relative">
          <SectionHeading
            title="Why InnoVision?"
            subtitle="Here's what makes us stand out as a student community."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 group h-full flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-2">{card.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{card.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
