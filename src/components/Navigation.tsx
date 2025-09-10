import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Settings } from "lucide-react";

const Navigation = () => {
  const navItems = [
    { to: '/', icon: Calendar, label: 'Сессия' },
    { to: '/attendance', icon: Users, label: 'Посещаемость' },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <nav className="flex justify-center">
          <div className="flex space-x-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </CardContent>
    </Card>
  );
};

export default Navigation;