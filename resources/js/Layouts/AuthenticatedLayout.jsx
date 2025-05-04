import { useState } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import Footer from "@/Components/Footer";
import NavLink from "@/Components/NavLink";
import { Link } from "@inertiajs/react";
import SideBar from "@/Components/SideBar";
import { Menu, UserRound } from "lucide-react";

export default function Authenticated({ user, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <nav className="bg-white border-b border-stone-200">
                <div className="h-[60px] h-14 mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-[60px] items-center">
                        <div className="flex items-center">
                            <button
                                className="md:hidden mr-2"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5 text-gray-600" />
                            </button>
                            <div
                                className={`md:block ${sidebarOpen ? "hidden" : ""
                                    }`}
                            >
                                <ApplicationLogo textColor="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent" />
                            </div>
                        </div>
                        <div className="sm:flex sm:items-center sm:ms-6">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button type="button" className="text-gray-600">
                                        <UserRound />
                                    </button>
                                </Dropdown.Trigger>
                                <div className="hidden sm:flex sm:items-center ">
                                    <div className="ms-3 relative">
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center text-gray-950 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md bg-white focus:outline-none transition ease-in-out duration-150"
                                                >
                                                    {user.username}
                                                    <svg
                                                        className="ms-2 -me-0.5 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>
                                    </div>
                                </div>
                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route("profile.edit")}
                                    >
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="flex-1 flex flex-row">
                <SideBar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
            </div>
            <Footer/>
        </div>
    );
}
