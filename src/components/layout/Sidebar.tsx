
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import {
  Home,
  FileText,
  Users,
  Settings,
  BarChart3,
  QrCode,
  Plane,
  FileCheck,
  Mail,
  ClipboardList,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Documents',
    icon: FileText,
    submenu: [
      {
        title: 'Qualité Doc',
        url: '/documents/qualite',
        icon: FileCheck,
      },
      {
        title: 'Formulaires Doc',
        url: '/documents/formulaires',
        icon: FileSpreadsheet,
      },
    ]
  },
  {
    title: 'Correspondances',
    url: '/correspondances',
    icon: Mail,
  },
  {
    title: 'Procès-Verbaux',
    url: '/proces-verbaux',
    icon: ClipboardList,
  },
  {
    title: 'Actions & Tâches',
    url: '/actions',
    icon: Activity,
  },
  {
    title: 'QR Codes',
    url: '/qr-codes',
    icon: QrCode,
  },
  {
    title: 'Utilisateurs',
    url: '/users',
    icon: Users,
  },
  {
    title: 'Rapports',
    url: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Paramètres',
    url: '/settings',
    icon: Settings,
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Documents']);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (url: string) => location.pathname === url;

  return (
    <SidebarContainer className="border-r border-gray-200 bg-white/95 backdrop-blur-sm">
      <SidebarHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-aviation-sky to-aviation-sky-dark rounded-xl flex items-center justify-center shadow-lg">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AeroDoc</h2>
            <p className="text-xs text-gray-500">Flow System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <div>
                      <SidebarMenuButton
                        onClick={() => toggleMenu(item.title)}
                        className={`w-full justify-between hover:bg-aviation-sky/10 transition-colors ${
                          expandedMenus.includes(item.title) ? 'bg-aviation-sky/5' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className="w-5 h-5 mr-3" />
                          <span>{item.title}</span>
                        </div>
                        <div className={`transform transition-transform ${
                          expandedMenus.includes(item.title) ? 'rotate-90' : ''
                        }`}>
                          ▶
                        </div>
                      </SidebarMenuButton>
                      {expandedMenus.includes(item.title) && (
                        <div className="ml-6 mt-1 space-y-1 animate-fade-in">
                          {item.submenu.map((subItem) => (
                            <SidebarMenuButton key={subItem.title} asChild>
                              <Link
                                to={subItem.url}
                                className={`flex items-center text-sm py-2 px-3 rounded-md transition-colors ${
                                  isActive(subItem.url)
                                    ? 'bg-aviation-sky text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <subItem.icon className="w-4 h-4 mr-2" />
                                {subItem.title}
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                          isActive(item.url)
                            ? 'bg-aviation-sky text-white'
                            : 'text-gray-700 hover:bg-aviation-sky/10'
                        }`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarContainer>
  );
};
