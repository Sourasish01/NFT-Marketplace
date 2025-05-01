'use client';

import React from 'react'
import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Home, PlusCircle, Key, Wallet } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";



const Navbar = () => {
    const user = false;
    const isAdmin = true;
    const cart = 3;

	const tabs = [
		{ id: "home", label: "Home", icon: Home },
		{ id: "create", label: "Create", icon: PlusCircle },
		{ id: "owned", label: "Owned", icon: Key },
		
	];

	const [activeTab, setActiveTab] = useState("home");


    return (
		<header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex flex-wrap justify-between items-center'>
					<Link href='/' className='text-2xl font-bold text-emerald-400 items-center space-x-2 flex'>
						Marketplace
					</Link>

					<div className='flex flex-wrap justify-center '>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center px-2 py-2 mx-2 rounded-md transition-colors duration-200 ${
									activeTab === tab.id
										? "bg-emerald-600 text-white"
										: "bg-gray-700 text-gray-300 hover:bg-gray-600"
								}`}
							>
								<tab.icon className='mr-0 h-5 w-5 sm:mr-2' />
								<span className='hidden sm:inline'>{tab.label}</span>
							</button>
						))}
				    </div>

					<div className='flex flex-wrap justify-center '>
						<button
						key="connect wallet"
						className={`flex items-center px-2 py-2 mx-2 rounded-md transition-colors duration-200 bg-blue-900 text-gray-300 hover:bg-blue-700`}
						// onClick={() => alert("Connect Wallet")}
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
  