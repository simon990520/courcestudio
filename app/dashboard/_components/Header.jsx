"use client";

import { adminConfig } from "@/configs/AdminConfig";
import { useClerk, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { CiPower } from "react-icons/ci";
import {
  HiOutlineHome,
  HiOutlineShieldCheck,
  HiOutlineSquare3Stack3D,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
} from "react-icons/hi2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user } = useUser();
  const path = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();
  const { openUserProfile } = useClerk();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClose = () => {
    console.log('Cerrando menú');
    setIsOpen(false);
  };
  
  const isAdmin = adminConfig.emails.includes(
    user?.primaryEmailAddress?.emailAddress
  );

  const handleLogout = async () => {
    console.log('Logout clicked');
    handleClose();
    await signOut({ redirectTo: '/' });
  };

  const handleAccountClick = () => {
    console.log('Account clicked');
    handleClose();
    openUserProfile();
  };

  const isActiveRoute = (itemPath) => {
    // For dashboard home
    if (itemPath === '/dashboard' && path === '/dashboard') {
      return true;
    }
    // For other routes, check if the current path starts with the menu item path
    // but exclude the dashboard path to prevent it from being active when in subroutes
    return itemPath !== '/dashboard' && path.startsWith(itemPath);
  };

  const menu = [
                {
                  id: 1,
                  name: "Inicio",
                  icon: <HiOutlineHome />,
                  path: "/dashboard",
                },
                {
                  id: 2,
                  name: "Explorar",
                  icon: <HiOutlineSquare3Stack3D />,
                  path: "/dashboard/explore",
                },
                {
                  id: 3,
                  name: "Materias",
                  icon: <HiOutlineBookOpen />,
                  path: "/dashboard/subjects",
                },
                {
                  id: 4,
                  name: "Apuntes",
                  icon: <HiOutlineBookOpen />,
                  path: "/dashboard/notes",
                },
                {
                  id: 5,
                  name: "Repasar",
                  icon: <HiOutlineAcademicCap />,
                  path: "/dashboard/review",
                },
                {
                  id: 7,
                  name: "Cuenta",
                  icon: <HiOutlineShieldCheck />,
                  path: "#",
                  onClick: handleAccountClick,
                },
                ...(isAdmin
                  ? [
                      {
                        id: 7,
                        name: "Admin Users",
                        icon: <HiOutlineShieldCheck />,
                        path: "/dashboard/admin-users",
                      },
                    ]
                  : []),
                {
                  id: 8,
                  name: "Salir",
                  icon: <CiPower />,
                  path: "/dashboard/logout",
                  isLogout: true,
                },
            ];

            return (
              <div className="flex justify-between items-center gap-2 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Link className="flex items-center gap-2 cursor-pointer" href={'/'}>
                    <Image src={"/logo.png"} width={44} height={44} alt="Kunno App Logo" />
                    <span className="font-bold text-xl">Kunno app</span>
                  </Link>
                </div>
                
                <div className="md:hidden">
                  <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all duration-200 border border-orange-200">
                        <span className="text-sm font-medium text-orange-600">Menú</span>
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    {isOpen && (
                      <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
                        <div className="flex flex-col items-center justify-start min-h-screen w-full pt-16 pb-10 px-4">
                          <button 
                            className="absolute top-4 right-4 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full transition-all duration-200"
                            onClick={handleClose}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className="w-full max-w-sm">
                            <h2 className="text-center text-xl font-semibold text-orange-600 mb-4">
                              Menú Principal
                            </h2>
                            <div className="w-16 h-px bg-orange-200 mx-auto mb-4" />
                            {menu.map((item) => (
                              item.isLogout ? (
                                <li
                                  key={item.id}
                                  className="flex items-center justify-center gap-3 px-4 py-4 text-base text-red-600 cursor-pointer hover:bg-red-50 rounded-xl transition-all duration-200 mb-3 w-full"
                                  onClick={handleLogout}
                                >
                                  <div className="text-xl">{item.icon}</div>
                                  <h2 className="font-medium">{item.name}</h2>
                                </li>
                              ) : item.onClick ? (
                                <li
                                  key={item.id}
                                  className={`flex items-center justify-center gap-3 px-4 py-4 text-base cursor-pointer rounded-xl transition-all duration-200 mb-3 w-full
                                    ${isActiveRoute(item.path) 
                                      ? "bg-orange-100 text-orange-600" 
                                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                    }`}
                                  onClick={item.onClick}
                                >
                                  <div className="text-xl">{item.icon}</div>
                                  <h2 className="font-medium">{item.name}</h2>
                                </li>
                              ) : (
                                <Link 
                                  href={item.path} 
                                  key={item.id} 
                                  className="w-full block"
                                  onClick={(e) => {
                                    console.log('Link clicked');
                                    handleClose();
                                  }}
                                >
                                  <li
                                    className={`flex items-center justify-center gap-3 px-4 py-4 text-base cursor-pointer rounded-xl transition-all duration-200 mb-3 w-full
                                      ${isActiveRoute(item.path) 
                                        ? "bg-orange-100 text-orange-600" 
                                        : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                                      }`}
                                  >
                                    <div className="text-xl">{item.icon}</div>
                                    <h2 className="font-medium">{item.name}</h2>
                                  </li>
                                </Link>
                              )
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </DropdownMenu>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            );
};

export default Header;
