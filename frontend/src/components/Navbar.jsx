'use client';

import { Home, PlusCircle, Key, Wallet } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

import { usePathname } from "next/navigation"; // Use usePathname() from Next.js's next/navigation to detect the current path on page load and set the correct active tab.

import { useEffect, useState } from "react";



const Navbar = () => {
   

	
	const { connectWallet } = useAuthStore();
	const pathname = usePathname(); // 🧠 Get current path

	const tabs = [
		{ id: "home", label: "Home", icon: Home, link: "/" },
		{ id: "create", label: "Create", icon: PlusCircle, link: "create" },
		{ id: "owned", label: "Owned", icon: Key, link: "owned" },
		
	];

	const getInitialTab = () => {
		const match = tabs.find(tab => `/${tab.link}` === pathname);
		return match ? match.id : "home";
	};

	const [activeTab, setActiveTab] = useState(getInitialTab);




    return (
		<header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex flex-wrap justify-between items-center'>
					<div className='text-2xl font-bold text-emerald-400 items-center space-x-2 flex'>
						Marketplace
					</div>

					<div className='flex flex-wrap justify-center '>
						{tabs.map((tab) => (
							
						<Link
							key={tab.id}
							href={`/${tab.link}`} // takes the user to the respective page upon clicking the button
							/*onClick={() => setActiveTab(tab.id)}
							className={`flex items-center px-2 py-2 mx-2 rounded-md transition-colors duration-200 ${
								activeTab === tab.id
									? "bg-emerald-600 text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
							}`}*/

						>
							<div
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center px-2 py-2 mx-2 rounded-md transition-colors duration-200 ${
								activeTab === tab.id
									? "bg-emerald-600 text-white"
									: "bg-gray-700 text-gray-300 hover:bg-gray-600"
								}`}
							>
								<tab.icon className='mr-0 h-5 w-5 sm:mr-2' />
								<span className='hidden sm:inline'>{tab.label}</span>
							</div>
						</Link>
							
						))}
				    </div>

					<div className='flex flex-wrap justify-center '>
						<button
						key="connect wallet"
						className={`flex items-center px-2 py-2 mx-2 rounded-md transition-colors duration-200 bg-blue-900 text-gray-300 hover:bg-blue-700`}
						onClick={() => connectWallet()}
						>
							<Wallet className='mr-0 h-5 w-5 sm:mr-2' />
							<span className='hidden sm:inline'>Connect Wallet</span>

						</button>
					</div>

				</div>
			</div>
		</header>
	);
};
export default Navbar;
  