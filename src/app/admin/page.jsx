"use client"
import React, { useState } from 'react'
import { useAuth } from '../context/context';
import toast from 'react-hot-toast';

export default function page() {
  const { address, loggedIn, state } = useAuth();
  const { contract } = state;
  const [clientAddress, setClientAddress] = useState('')
  const [role, setRole] = useState('0');
  const [loading,setLoading] = useState(false);
  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    setLoading(true);
    if (clientAddress && address && contract) {
      try {
        const userRole = role === '0' ? 0 : 1;
        const tx = await contract.addUser(clientAddress, userRole);
        await tx.wait(); // Wait for transaction to be mined

        toast.success('User added successfully!');
      } catch (error) {
        console.error('Error adding user:', error);
        toast.error('Failed to add user. Please try again.');
      }
      finally{
        setLoading(false);
      }
    }
    else {
      toast.error("Please Connect Your Wallet")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-[200px] lg:mt-[300px] p-1">
      <form className=" shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-lg text-white  font-bold mb-2" htmlFor="address">
            Address
          </label>
          <input
            className="shadow font-extrabold appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="address"
            type="text"
            placeholder="Enter Client's Wallet address"
            value={clientAddress}
            onChange={(e) => { setClientAddress(e.target.value) }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-white text-lg font-bold mb-2" htmlFor="role">
            User Role
          </label>
          <select
            id="role"
            className="block appearance-none font-extrabold w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={role}
            onChange={handleRoleChange}
          >
            <option value='0'>Manufacturer</option>
            <option value='1'>Retailer</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            disabled={!loggedIn || loading}
            className={`font-bold  py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loggedIn ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-gray-500 text-black cursor-not-allowed'
              }`}
            type="submit"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
}