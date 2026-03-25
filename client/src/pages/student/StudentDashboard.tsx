import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../lib/api';
import type { Position } from '../../types';

export function StudentDashboard() {
  const [applications, setApplications] = useState<Array<{ id: string; positionId: string; positionTitle?: string; labName?: string; status: string; appliedAt: string }>>([]);
  const [recommended, setRecommended] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.applications.mine(), api.positions.recommended()])
      .then(([apps, recs]) => {
        setApplications(apps);
        setRecommended(recs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse h-8 bg-slate-200 rounded w-1/3 mb-6" />
          <div className="animate-pulse h-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-inherit mb-6">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-inherit mb-2">Profile</h2>
              <p className="text-inherit mb-4">Complete your profile to stand out to PIs.</p>
              <Link
                to="/student/profile"
                className="text-teal-600 font-medium hover:underline"
              >
                Edit profile →
              </Link>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-inherit mb-2">Browse Positions</h2>
              <p className="text-inherit mb-4">Find research opportunities that match your skills.</p>
              <Link
                to="/student/positions"
                className="text-teal-600 font-medium hover:underline"
              >
                Browse positions →
              </Link>
            </div>
          </Card>
        </div>
        {recommended.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-inherit mb-4">Recommended Positions</h2>
            <div className="space-y-3 mb-8">
              {recommended.map((pos) => (
                <Card key={pos.id}>
                  <div className="p-4 flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/student/positions/${pos.id}`}
                        className="font-medium text-inherit hover:text-teal-600"
                      >
                        {pos.title}
                      </Link>
                      {pos.labName && <p className="text-sm text-inherit">{pos.labName}</p>}
                      {pos.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pos.requiredSkills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {pos.requiredSkills.length > 4 && (
                            <span className="text-xs text-slate-400">+{pos.requiredSkills.length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                      {pos.minGpa && (
                        <span className="text-xs text-slate-500">Min GPA: {pos.minGpa}</span>
                      )}
                      <Link
                        to={`/student/positions/${pos.id}`}
                        className="text-sm text-teal-600 hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
        <h2 className="text-lg font-semibold text-inherit mb-4">Recent Applications</h2>
        {applications.length === 0 ? (
          <Card>
            <div className="p-6 text-center text-inherit">
              No applications yet. <Link to="/student/positions" className="text-teal-600 hover:underline">Browse positions</Link> to apply.
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <Card key={app.id}>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <Link to={`/student/positions/${app.positionId}`} className="font-medium text-inherit hover:text-teal-600">
                      {app.positionTitle || 'Position'}
                    </Link>
                    {app.labName && <p className="text-sm text-inherit">{app.labName}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status as 'pending' | 'reviewing' | 'accepted' | 'rejected'} />
                    <Link to="/student/applications" className="text-sm text-teal-600 hover:underline">
                      View all →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
