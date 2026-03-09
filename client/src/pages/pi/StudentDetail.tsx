import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { api } from '../../lib/api';
import type { StudentProfile } from '../../types';

export function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.students
      .getById(id)
      .then(setStudent)
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse h-8 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-slate-600">Student not found.</p>
          <Link to="/pi/students" className="text-teal-600 hover:underline mt-2 inline-block">
            Back to students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/pi/students" className="text-teal-600 hover:underline mb-4 inline-block">
          ← Back to students
        </Link>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-slate-600">{student.email}</p>
          <div className="mt-6 space-y-4">
            {student.major && (
              <div>
                <h3 className="text-sm font-medium text-slate-500">Major</h3>
                <p>{student.major}</p>
              </div>
            )}
            {student.gpa != null && (
              <div>
                <h3 className="text-sm font-medium text-slate-500">GPA</h3>
                <p>{student.gpa}</p>
              </div>
            )}
            {student.graduationYear && (
              <div>
                <h3 className="text-sm font-medium text-slate-500">Graduation Year</h3>
                <p>{student.graduationYear}</p>
              </div>
            )}
            {student.yearLevel && (
              <div>
                <h3 className="text-sm font-medium text-slate-500">Year Level</h3>
                <p className="capitalize">{student.yearLevel}</p>
              </div>
            )}
            {student.skills && student.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500">Skills</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {student.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {student.bio && (
              <div>
                <h3 className="text-sm font-medium text-slate-500">Bio</h3>
                <p className="whitespace-pre-wrap text-slate-700">{student.bio}</p>
              </div>
            )}
            {student.resumeUrl && (
              <div>
                <h3 className="text-sm font-medium text-slate-500">Resume</h3>
                <a
                  href={student.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline"
                >
                  View resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
