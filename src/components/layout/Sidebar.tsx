
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  FileCheck,
  FileSpreadsheet,
  Mail,
  ClipboardList,
  Users,
  CheckSquare,
  QrCode,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Plane,
  FilePlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  children?: NavItem[];
  permission?: string;
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Documents',
    icon: FileText,
    children: [
      {
        title: 'Nouveau Doc',
        href: '/documents/nouveau',
        icon: FilePlus,
        permission: 'create_documents'
      },
      {
        title: 'Qualité Doc',
        href: '/documents/qualite',
        icon: FileCheck,
        permission: 'view_documents'
      },
      {
        title: 'Formulaires Doc',
        href: '/documents/formulaires',
        icon: FileSpreadsheet,
        permission: 'manage_forms'
      }
    ]
  },
  {
    title: 'Correspondances',
    href: '/correspondances',
    icon: Mail,
    permission: 'view_documents'
  },
  {
    title: 'Procès-Verbaux',
    href: '/proces-verbaux',
    icon: ClipboardList,
    permission: 'view_documents'
  },
  {
    title: 'Utilisateurs',
    href: '/users',
    icon: Users,
    permission: 'manage_users'
  },
  {
    title: 'Actions',
    href: '/actions',
    icon: CheckSquare,
    permission: 'view_documents'
  },
  {
    title: 'QR Codes',
    href: '/qr-codes',
    icon: QrCode,
    permission: 'view_documents'
  },
  {
    title: 'Rapports',
    href: '/reports',
    icon: BarChart3,
    permission: 'view_reports'
  },
  {
    title: 'Paramètres',
    href: '/settings',
    icon: Settings,
    permission: 'manage_settings'
  }
];

export const Sidebar = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Documents']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const hasPermissionForItem = (item: NavItem): boolean => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!hasPermissionForItem(item)) return null;

    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href ? location.pathname === item.href : false;

    if (hasChildren) {
      const visibleChildren = item.children.filter(hasPermissionForItem);
      if (visibleChildren.length === 0) return null;

      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              'hover:bg-white/10 text-aviation-sky-light'
            )}
          >
            <div className="flex items-center">
              <item.icon className="w-4 h-4 mr-3" />
              {item.title}
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {visibleChildren.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        to={item.href!}
        className={cn(
          'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          level > 0 ? 'ml-4' : '',
          isActive
            ? 'bg-white/20 text-white'
            : 'text-aviation-sky-light hover:bg-white/10 hover:text-white'
        )}
      >
        <item.icon className="w-4 h-4 mr-3" />
        {item.title}
      </Link>
    );
  };

  return (
    <div className="w-64 bg-gradient-to-b from-aviation-sky to-aviation-sky-dark h-screen flex flex-col">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AeroDoc</h1>
            <p className="text-sm text-aviation-sky-light">Gestion Documentaire</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map(item => renderNavItem(item))}
      </nav>
    </div>
  );
};
