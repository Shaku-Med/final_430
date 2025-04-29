"use client";
import { motion } from "framer-motion";
import { PiStackSimpleBold } from "react-icons/pi";
import { FaServer } from "react-icons/fa";
import { AiOutlinePartition } from "react-icons/ai";
import { BiSolidCube } from "react-icons/bi";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navigationItems = [
  {
    title: "Home",
    icon: Home,
    href: "/",
  },
  {
    title: "Cell",
    icon: PiStackSimpleBold,
    href: "/cell",
  },
  {
    title: "Volume",
    icon: BiSolidCube,
    href: "/volume",
  },
  {
    title: "File Server",
    icon: FaServer,
    href: "/fileserver",
  },
  {
    title: "Partitions",
    icon: AiOutlinePartition,
    href: "/partitions",
  },
];

export function AppSidebar() {
  const currentPath = usePathname();

  return (
    <div className="flex overflow-x-hidden h-full flex-col bg-muted/80 backdrop-blur-md">
      <div className="flex h-16 bg-card items-center border-b px-4">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground">
            <img src="/icon.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <span>CSI Spotlight</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        <div className="px-3 py-2">
          <nav className="space-y-1 relative mhelp">
          {navigationItems.map((item) => {
                const isActive = 
                    (item.href === '/' && (currentPath === '/' || currentPath === '')) ||
                    (item.href !== '/' && currentPath?.startsWith(item.href));
                
                return (
                    <Link
                    key={item.title}
                    href={item.href}
                    className="relative block"
                    >
                    {isActive && (
                        <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 rounded-md bg-primary shadow-md z-0"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <div
                        className={`relative z-10 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                            ? "text-background"
                            : "hover:bg-primary/10 hover:text-foreground"
                        }`}
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                    </div>
                    </Link>
                );
           })}
          </nav>
        </div>
      </div>
      <div className="border-t p-4 text-center bg-card text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CSI Spotlight. All rights reserved.
      </div>
    </div>
  );
}