"use client";

import React, { useContext, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { 
  HiOutlineHome,
  HiOutlineShieldCheck, 
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineLightBulb
} from "react-icons/hi";
import { HiOutlineSquare3Stack3D } from "react-icons/hi2";
import { CiPower } from "react-icons/ci";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { UserCourseListContext } from "@/app/_context/UserCourseListContext";
import Image from "next/image";
import { useClerk, useUser, UserButton } from "@clerk/nextjs";
import { adminConfig } from "@/configs/AdminConfig";

const Sidebar = () => {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const path = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();
  const { userCourseList, setUserCourseList } = useContext(UserCourseListContext);
  const [activeItem, setActiveItem] = useState(null);

  const isAdmin = adminConfig.emails.includes(user?.primaryEmailAddress?.emailAddress);
  
  const handleLogout = async () => {
    await signOut({ redirectTo: '/' });
  };

  const handleAccountClick = () => {
    setActiveItem('account');
    openUserProfile();
  };

  const isActiveRoute = (itemPath, itemId) => {
    if (itemId === 5) {
      return activeItem === 'account';
    }
    
    // Special case for dashboard home
    if (itemPath === '/dashboard' && path === '/dashboard') {
      return true;
    }
    
    // For other routes, check if the current path matches the menu item path
    if (itemPath !== '/dashboard') {
      return path === itemPath;
    }
    
    return false;
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
      path: "/explore-course",
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
            id: 8,
            name: "Admin Users",
            icon: <HiOutlineShieldCheck />,
            path: "/dashboard/admin-users",
          },
        ]
      : []),
    {
      id: 9,
      name: "Salir",
      icon: <CiPower />,
      path: "/dashboard/logout",
      isLogout: true,
    },
  ];

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else {
      setActiveItem(item.id);
    }
  };

  return (
    <div className="fixed h-full md:w-64 p-4 shadow-md">
      <Image src={"/logo.png"} width={44} height={44} alt="Kunno App Logo" />
      <hr className="my-3" />

      <div className="mt-3">
        {menu.map((item) => (
          <Link
            href={item.isLogout ? "#" : item.path}
            key={item.id}
            onClick={(e) => {
              if (item.isLogout) {
                e.preventDefault();
                handleLogout();
              } else {
                handleItemClick(item);
              }
            }}
          >
            <div
              className={`flex gap-2 items-center p-3 text-[18px] text-gray-500 cursor-pointer rounded-md mb-1 hover:bg-orange-50 hover:text-orange-500
                ${
                  isActiveRoute(item.path, item.id)
                    ? "bg-orange-50 text-orange-500 font-medium"
                    : ""
                }
              `}
            >
              {item.icon}
              <h2 className="text-[16px]">{item.name}</h2>
            </div>
          </Link>
        ))}
      </div>

      {/* <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-gray-500">Storage</h2>
          <Progress value={33} className="h-2" />
          <h2 className="text-orange-500">2.5GB Used of 5GB</h2>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;