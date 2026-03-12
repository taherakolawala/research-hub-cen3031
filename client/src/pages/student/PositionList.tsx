import React, { useState, useMemo } from 'react';
import { ResearchPosition } from '@research-hub/shared';

// Mock Data
const MOCK_POSITIONS: ResearchPosition[] = [
  {
    id: 'p1',
    professorId: 'prof1',
    title: 'Machine Learning Research Assistant',
    description: 'Looking for a passionate student to help build deep learning models for healthcare analytics. You will work extensively with PyTorch and standard NLP datasets.',
    department: 'Computer Science',
    university: 'University of Central Florida',
    requiredSkills: ['Python', 'PyTorch'],
    preferredSkills: ['NLP', 'Docker'],
    compensationType: 'paid',
    compensationDetails: '$15/hr',
    minGpa: 3.5,
    academicLevel: ['Undergraduate', 'Graduate'],
    hoursPerWeek: 15,
    status: 'open',
    tags: ['AI', 'Health', 'Deep Learning'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    professorId: 'prof2',
    title: 'Cognitive Science Lab Volunteer',
    description: 'We are seeking help mapping behavioral responses in sleep deprived animals. Great opportunity to learn foundational lab techniques and data entry.',
    department: 'Neuroscience',
    university: 'University of Central Florida',
    requiredSkills: ['Data Entry'],
    preferredSkills: ['R', 'Statistics'],
    compensationType: 'unpaid',
    minGpa: 3.0,
    academicLevel: ['Undergraduate'],
    hoursPerWeek: 10,
    status: 'open',
    tags: ['Psychology', 'Animals', 'Lab Work'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    professorId: 'prof3',
    title: 'Cybersecurity Analyst internally funded',
    description: 'Funded PhD or advanced Masters student required for threat intelligence scraping and vulnerability analysis algorithm research.',
    department: 'Computer Science',
    university: 'University of Central Florida',
    requiredSkills: ['Python', 'Networking', 'Linux'],
    preferredSkills: ['Reverse Engineering'],
    compensationType: 'stipend',
    compensationDetails: 'Full tuition + $2000/mo',
    minGpa: 3.8,
    academicLevel: ['Graduate', 'PhD'],
    hoursPerWeek: 30,
    status: 'open',
    tags: ['Security', 'Cryptography'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    professorId: 'prof4',
    title: 'Materials Engineering Study',
    description: 'Assist in testing the tensile strength of newly developed polymer composites using the Instron machine. Ideal for upper level undergrads seeking course credit.',
    department: 'Mechanical Engineering',
    university: 'University of Central Florida',
    requiredSkills: ['AutoCAD'],
    preferredSkills: ['Material Science Lab Experience'],
    compensationType: 'credit',
    compensationDetails: '3 Course Credits',
    minGpa: 3.2,
    academicLevel: ['Undergraduate'],
    hoursPerWeek: 12,
    status: 'open',
    tags: ['Polymers', 'Testing'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export function PositionList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [gpaFilter, setGpaFilter] = useState<number | ''>('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [fundedOnly, setFundedOnly] = useState(false);

  const filteredPositions = useMemo(() => {
    return MOCK_POSITIONS.filter((pos) => {
      // 1. Text Search (Title/Desc)
      const matchesSearch = searchTerm === '' || 
        pos.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pos.description.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Major/Department
      const matchesMajor = majorFilter === '' || 
        pos.department.toLowerCase().includes(majorFilter.toLowerCase());

      // 3. GPA filter
      const matchesGpa = gpaFilter === '' || 
        (pos.minGpa === undefined || pos.minGpa <= Number(gpaFilter));

      // 4. Skills Filter
      const userSkills = skillsFilter.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
      const matchesSkills = userSkills.length === 0 || userSkills.every(skill => 
        pos.requiredSkills.some(rs => rs.toLowerCase().includes(skill)) ||
        pos.preferredSkills.some(ps => ps.toLowerCase().includes(skill)) ||
        pos.tags.some(tag => tag.toLowerCase().includes(skill))
      );

      // 5. Academic Level
      const matchesLevel = levelFilter === '' || 
        (pos.academicLevel?.includes(levelFilter as any));

      // 6. Funded Position Toggle (Exclude 'unpaid' and sometimes 'credit')
      const matchesFunding = !fundedOnly || (pos.compensationType === 'paid' || pos.compensationType === 'stipend');

      return matchesSearch && matchesMajor && matchesGpa && matchesSkills && matchesLevel && matchesFunding;
    });
  }, [searchTerm, majorFilter, gpaFilter, skillsFilter, levelFilter, fundedOnly]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-6 sm:p-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* LEFT COMPONENT: The Filter Sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0">
          <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 sticky top-8 shadow-xl">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              Filter Search
            </h2>

            <div className="space-y-6">
              {/* Department / Major Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department / Major</label>
                <input 
                  type="text" 
                  placeholder="e.g. Computer Science" 
                  value={majorFilter}
                  onChange={e => setMajorFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* GPA Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your GPA</label>
                <input 
                  type="number" 
                  step="0.01" max="4.0" min="0"
                  placeholder="e.g. 3.5" 
                  value={gpaFilter}
                  onChange={e => setGpaFilter(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Skills Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Python, NLP" 
                  value={skillsFilter}
                  onChange={e => setSkillsFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Academic Level Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Level</label>
                <select 
                  value={levelFilter}
                  onChange={e => setLevelFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Any Level</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              {/* Funded Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${fundedOnly ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${fundedOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={fundedOnly} 
                    onChange={() => setFundedOnly(!fundedOnly)} 
                  />
                  <span className="text-sm font-medium group-hover:text-white transition">Paid Positions Only</span>
                </label>
              </div>

            </div>
          </div>
        </aside>

        {/* RIGHT COMPONENT: The Main Search Feed */}
        <main className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center bg-slate-800/40 p-4 border border-slate-700/50 rounded-2xl">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search research titles or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="mt-4 sm:mt-0 text-slate-400 text-sm font-medium px-4">
              Showing {filteredPositions.length} position{filteredPositions.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-6">
            {filteredPositions.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-12 text-center">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <h3 className="text-xl font-bold text-slate-300">No positions found</h3>
                <p className="text-slate-500 mt-2">Adjust your filters or try a different search term.</p>
              </div>
            ) : (
              filteredPositions.map(pos => (
                <div key={pos.id} className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-slate-700 text-xs font-bold text-slate-300 rounded-full uppercase tracking-wider">{pos.department}</span>
                        {pos.compensationType === 'paid' && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Paid</span>}
                        {pos.compensationType === 'stipend' && <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full border border-purple-500/20">Stipend</span>}
                        {pos.compensationType === 'credit' && <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">Course Credit</span>}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{pos.title}</h3>
                      <p className="text-slate-400 mt-3 line-clamp-2 md:line-clamp-none leading-relaxed text-sm">
                        {pos.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0 text-right w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-700">
                      <div className="inline-flex flex-col bg-slate-900 rounded-xl p-4 border border-slate-700/50 min-w-[140px]">
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Required GPA</span>
                        <span className="text-2xl font-black text-white">{pos.minGpa ? pos.minGpa.toFixed(1) : 'Any'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {pos.requiredSkills.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-medium rounded-md border border-indigo-500/20">{s}</span>
                    ))}
                    {pos.preferredSkills.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-md">{s}</span>
                    ))}
                  </div>

                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
