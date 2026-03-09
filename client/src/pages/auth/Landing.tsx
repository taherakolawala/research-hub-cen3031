import { Link, useNavigate } from 'react-router-dom';
import { NetworkBackground } from '../../components/ui/network-background';

export function Landing() {
  const navigate = useNavigate();

  const handleDemo = (role: 'student' | 'pi') => {
    navigate(role === 'student' ? '/student/dashboard' : '/pi/dashboard');
  };

  return (
    <div className="w-full min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#001A3E', color: 'rgb(255,165,0)' }}>
      {/* Network Background - nodes, connections, pulses */}
      <NetworkBackground />

      {/* Content - z-[100] ensures buttons are above background; pb-24 on mobile for TubelightNavBar */}
      <div className="relative z-[150] flex-1 flex flex-col items-center justify-center text-center px-4 pb-24 sm:pb-0">
        <h1 className="text-5xl md:text-8xl mb-8 max-w-5xl font-bold" style={{ color: 'rgb(255,165,0)' }}>
          The Smarter Way to Find Research
        </h1>
        <p className="text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgb(255,165,0)' }}>
          Browse positions, apply to labs, and grow your research career. For Students and PIs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 relative z-[130]">
          <div className="relative w-48 min-h-[3.5rem]">
            <Link
              to="/register"
              className="absolute inset-0 flex items-center justify-center rounded-2xl text-lg font-semibold transition-all hover:cursor-pointer duration-300 hover:scale-105 shadow-lg hover:shadow-xl no-underline"
              style={{ background: 'rgb(255,165,0)', color: '#00529B' }}
            >
              Register
            </Link>
          </div>
          <div className="relative w-48 min-h-[3.5rem]">
            <Link
              to="/login"
              className="absolute inset-0 flex items-center justify-center backdrop-blur-lg rounded-2xl text-lg font-semibold transition-all duration-300 hover:cursor-pointer hover:scale-105 shadow-lg hover:shadow-xl no-underline"
              style={{ border: '2px solid rgb(255,165,0)', color: 'rgb(255,165,0)' }}
            >
              Login
            </Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6 relative z-[130]">
          <p className="text-sm w-full sm:w-auto self-center opacity-70" style={{ color: 'rgb(255,165,0)' }}>
            Try a demo:
          </p>
          <button
            onClick={() => handleDemo('student')}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(255,165,0,0.15)', border: '1px solid rgba(255,165,0,0.4)', color: 'rgb(255,165,0)' }}
          >
            Demo Student
          </button>
          <button
            onClick={() => handleDemo('pi')}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: 'rgba(255,165,0,0.15)', border: '1px solid rgba(255,165,0,0.4)', color: 'rgb(255,165,0)' }}
          >
            Demo PI
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-[100] py-6">
        <div className="text-center text-sm" style={{ color: 'rgb(255,165,0)' }}>
          © {new Date().getFullYear()} ResearchHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
