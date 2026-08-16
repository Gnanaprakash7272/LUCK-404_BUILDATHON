import React from 'react';
import { TeacherProfile } from '../../types/academic';
import { BookOpen, Users, Calendar, Award } from 'lucide-react';

interface TeacherProfileCardProps {
  profile: TeacherProfile;
}

export const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-brand-600 rounded-2xl p-6 text-white shadow-card mb-8 relative overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"}
            alt={profile.name}
            className="w-16 h-16 rounded-2xl border border-white/20 object-cover shadow-sm"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 text-white text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>{profile.role}</span>
            </div>
            <h2 className="text-2xl font-display font-semibold tracking-tight">{profile.name}</h2>
            <p className="text-sm text-brand-100 font-medium mt-0.5">{profile.department}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-black/10 px-5 py-3 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-brand-100 uppercase font-bold tracking-wider block">Assigned Courses</span>
            <span className="text-xl font-display font-semibold">{profile.assigned_courses_count}</span>
          </div>

          <div className="bg-black/10 px-5 py-3 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-brand-100 uppercase font-bold tracking-wider block">Assigned Classes</span>
            <span className="text-xl font-display font-semibold">{profile.assigned_classes_count}</span>
          </div>

          <div className="bg-black/10 px-5 py-3 rounded-xl border border-white/10 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-brand-100 uppercase font-bold tracking-wider block">Academic Term</span>
            <span className="text-sm font-semibold mt-1 block">Fall 2026</span>
          </div>
        </div>
      </div>
    </div>

  );
};
