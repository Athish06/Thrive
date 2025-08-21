import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '../ui/sidebar';
import {
  Home,
  Users,
  BarChart3,
  Settings,
  Baby,
  BookOpen,
  Target,
  ChevronRight,
  User,
  GraduationCap,
  Activity,
  Calendar,
  FileText,
  HeadphonesIcon,
} from 'lucide-react';

interface MenuItemType {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  submenu?: { label: string; path: string }[];
}

interface MenuSectionType {
  title: string;
  items: MenuItemType[];
}

export const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const therapistMenuItems: MenuSectionType[] = [
    {
      title: "Overview",
      items: [
        { 
          icon: Home, 
          label: 'Dashboard', 
          path: '/dashboard' 
        },
        
      ]
    },
    {
      title: "Little Learners",
      items: [
        { 
          icon: Users, 
          label: 'My Caseload', 
          path: '/learners',
          submenu: [
            { label: 'All Learners', path: '/learners' },
            { label: 'Active Therapy', path: '/learners/active' },
            { label: 'New Enrollments', path: '/learners/new' },
            { label: 'Assessment Due', path: '/learners/assessment' },
            { label: 'Inactive/On Hold', path: '/learners/inactive' },
          ]
        },
        { 
          icon: GraduationCap, 
          label: 'Assessment Tools', 
          path: '/assessments' 
        },
        
      ]
    },
    {
      title: "Management",
      items: [
        { 
          icon: Calendar, 
          label: 'Session Planning', 
          path: '/sessions' 
        },
        { 
          icon: BarChart3, 
          label: 'Reports & Analytics', 
          path: '/reports' 
        },
        { 
          icon: FileText, 
          label: 'Documentation', 
          path: '/documentation' 
        },
      ]
    }
  ];

  const parentMenuItems: MenuSectionType[] = [
    {
      title: "Home",
      items: [
        { 
          icon: Home, 
          label: 'Dashboard', 
          path: '/dashboard' 
        },
        { 
          icon: Baby, 
          label: 'My Little Learner', 
          path: '/child' 
        },
      ]
    },
    {
      title: "Learning & Progress",
      items: [
        { 
          icon: BarChart3, 
          label: 'Progress Reports', 
          path: '/progress' 
        },
        { 
          icon: BookOpen, 
          label: 'Homework & Activities', 
          path: '/homework' 
        },
        { 
          icon: Target, 
          label: 'Goals & Milestones', 
          path: '/goals' 
        },
      ]
    },
    {
      title: "Communication",
      items: [
        { 
          icon: HeadphonesIcon, 
          label: 'Therapist Messages', 
          path: '/messages' 
        },
        { 
          icon: Calendar, 
          label: 'Appointments', 
          path: '/appointments' 
        },
      ]
    }
  ];

  const menuItems = user?.role === 'therapist' ? therapistMenuItems : parentMenuItems;

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold">
            TL
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">ThrivePath</span>
            <span className="truncate text-xs text-muted-foreground">Little Learners</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((section, index) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    {item.submenu ? (
                      <div>
                        <SidebarMenuButton 
                          isActive={isActivePath(item.path)}
                          onClick={() => handleNavigation(item.path)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                          <ChevronRight className="ml-auto h-4 w-4" />
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          {item.submenu.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.path}>
                              <SidebarMenuSubButton 
                                asChild
                                isActive={isActivePath(subItem.path)}
                              >
                                <button onClick={() => handleNavigation(subItem.path)}>
                                  <span>{subItem.label}</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </div>
                    ) : (
                      <SidebarMenuButton 
                        isActive={isActivePath(item.path)}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            {index < menuItems.length - 1 && <SidebarSeparator />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isActivePath('/settings')}
              onClick={() => handleNavigation('/settings')}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <SidebarSeparator />
        
        <SidebarMenu>
          <SidebarMenuItem>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};