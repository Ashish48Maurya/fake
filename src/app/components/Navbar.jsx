"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/context';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { address, connectWallet, loggedIn } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        const handleResize = () => {
            if (window.innerWidth >= 800) {
                setIsOpen(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const navigation = [
        { name: 'Admin', url: '/admin', current: false },
        { name: 'Retailer', url: '/retailer', current: false },
        { name: 'Manufacturer', url: '/manufacturer', current: false },
    ];

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 ${isScrolled ? 'bg-gray-800 bg-opacity-90 shadow-md' : 'bg-gray-800'} transition duration-300`}>
                <div className="container mx-auto flex justify-between items-center p-3">
                    <div className="flex justify-start items-center">
                        <Link href="/" className="text-xl font-bold text-gray-800 items-center flex">
                            <span className="font-extrabold text-xl lg:text-2xl text-gray-100">
                                is<span className="text-orange-600">Fake</span>
                            </span>
                        </Link>
                    </div>
                    <div className="hidden lg:flex space-x-6 items-center">
                        {navigation.map((item) => (
                            <Link key={item.name} href={item.url} className="text-gray-200 text-md hover:text-gray-400 font-semibold">
                                {item.name}
                            </Link>
                        ))}
                        <button className="bg-orange-600 p-2 rounded-md" disabled={loggedIn} onClick={connectWallet}>
                            {address ? <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span> : "Connect"}
                        </button>
                    </div>
                    <div className="lg:hidden">
                        <button onClick={toggleMenu} className={`text-gray-200 focus:outline-none ${!isOpen ? 'block' : 'hidden'}`}>
                            <svg
                                className={`w-6 h-6 transition-transform transform ${isOpen ? 'rotate-180' : 'rotate-0'} duration-300`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <div
                    className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={toggleMenu}
                />
                <div
                    className={`fixed inset-y-0 right-100 w-full bg-white p-4 transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-between flex-row-reverse">
                            <button onClick={toggleMenu} className="text-gray-800 focus:outline-none mb-4">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <Link href="/" className="text-xl font-bold text-gray-800 items-center flex">
                                <span className="font-extrabold text-xl lg:text-2xl text-black">
                                    is<span className="text-orange-600">Fake</span>
                                </span>
                            </Link>
                        </div>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.url}
                                className="text-gray-800 text-lg hover:bg-gray-100 p-2 rounded"
                                onClick={toggleMenu}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <button className="bg-orange-600 p-2 rounded-md" disabled={loggedIn} onClick={connectWallet}>
                            {address ? <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span> : "Connect"}
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}
