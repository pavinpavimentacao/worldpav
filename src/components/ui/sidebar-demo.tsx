"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, Calendar, FileText, Users, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Programação",
      href: "/programacao",
      icon: (
        <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Relatórios",
      href: "/reports",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Clientes",
      href: "/clients",
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Bombas Terceiras",
      href: "/bombas-terceiras",
      icon: (
        <Building2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Configurações",
      href: "/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen" // Usando h-screen para ocupar toda a altura
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "WorldPav",
                href: "/profile",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    FM
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        WorldPav
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

// Dummy dashboard component with content
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2">
          {[...new Array(4)].map((i) => (
            <div
              key={"first-array" + i}
              className="h-20 w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          {[...new Array(2)].map((i) => (
            <div
              key={"second-array" + i}
              className="h-full w-full rounded-lg  bg-gray-100 dark:bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
