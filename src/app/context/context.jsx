"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from '../context/Fake.json';
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        contract: null,
    });
    const [loggedIn, setLoggedIn] = useState(false);
    const [address, setAddress] = useState(null);

    const connectWallet = async () => {
        const contractAddress = "0x6BB5d380A0Cc05860206B4eD359bccfB2Cee9122"; // Sepolia
        const contractABI = abi;
        try {
            const { ethereum } = window;
            if (ethereum) {
                const accounts = await ethereum.request({
                    method: "eth_requestAccounts",
                });

                // Set up provider and contract
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(contractAddress, contractABI, signer);

                setAddress(accounts[0]);
                setLoggedIn(true);
                setState({ provider, signer, contract });

                toast.success("Wallet connected successfully!");
            } else {
                toast.error('Please install and log in to MetaMask to initiate the transaction.');
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            toast.error("An error occurred while connecting to the wallet. Please try again.");
        }
    };

    useEffect(() => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                    setLoggedIn(true);
                    toast.success("Account switched successfully!");
                } else {
                    setLoggedIn(false);
                    setAddress(null);
                    toast.error("Wallet disconnected!");
                }
            };

            const handleChainChanged = () => {
                window.location.reload(); // Reload the page to avoid stale data
            };

            // Subscribe to accounts change
            ethereum.on("accountsChanged", handleAccountsChanged);
            // Subscribe to chain change
            ethereum.on("chainChanged", handleChainChanged);

            return () => {
                // Cleanup listeners on unmount
                ethereum.removeListener("accountsChanged", handleAccountsChanged);
                ethereum.removeListener("chainChanged", handleChainChanged);
            };
        }
    }, []);

    return (
        <AuthContext.Provider value={{ address, state, connectWallet, loggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth used outside of the Provider");
    }
    return authContextValue;
};
