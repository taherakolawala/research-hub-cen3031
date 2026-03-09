import { Home, User, Briefcase, FileText } from 'lucide-react';
import { TubelightNavBar } from '@/components/ui/tubelight-navbar';
import type { NavItem } from '@/components/ui/tubelight-navbar';

export function DemoTubelightNavbar() {
  const navItems: NavItem[] = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '#', icon: User },
    { name: 'Projects', url: '#', icon: Briefcase },
    { name: 'Resume', url: '#', icon: FileText },
  ];

  return <TubelightNavBar items={navItems} />;
}
