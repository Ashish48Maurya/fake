"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { useAuth } from '../context/context';

export default function Page() {
  const scannerRef = useRef(null);
  const [decodedData, setDecodedData] = useState("");
  const [result, setResult] = useState("");
  const { state } = useAuth();
  const { contract } = state;

  useEffect(() => {
    const onScanSuccess = (decodedText) => {
      setDecodedData(decodedText);
      checkProductValidity(decodedText);
    };

    const scanner = new Html5QrcodeScanner(scannerRef.current.id, {
      fps: 10,
      qrbox: 250
    });

    scanner.render(onScanSuccess);

    return () => {
      scanner.clear();
    };
  }, [contract]);

  const checkProductValidity = async (productId) => {
    try {
      const [isReal, isSold, timeSlot] = await contract.isReal(productId);

      if (isReal) {
        setResult("The product is Real and not sold.");
        toast.success("Product is verified as Real and available.");
      } else if (isSold) {
        const formattedTimeSlot = new Date(timeSlot * 1000).toLocaleString();
        setResult(`The product is sold. Time slot: ${formattedTimeSlot}`);
        toast.error(`Product is sold. Time slot: ${timeSlot}`);
      } else {
        setResult("The product is Fake.");
        toast.error("Product is verified as Fake.");
      }
    } catch (error) {
      console.error("Error checking product validity:", error);
      toast.error("An error occurred while checking the product. Please try again.");
      setResult("Error occurred. Unable to verify the product.");
    }
  };

  return (
    <div className="w-full mt-[100px] lg:w-1/4 mx-auto">
      <h3 className="text-center text-xl">Scan Product</h3>

      <div ref={scannerRef} id="qr-reader" className='text-center w-full'></div>

      <div className=" mt-3 flex flex-col text-center">
        <div>
          <h4 className='text-orange-600 text-xl'>Decoded Product ID:</h4>
          <p className='text-lg'>{decodedData ? decodedData : "No QR code scanned yet."}</p>
        </div>

        <div>
          <h4 className='text-orange-600 text-xl'>Product Status:</h4>
          <p className='text-lg'>{result ? result : "Scan a product to check if it's real, fake, or sold."}</p>
        </div>
      </div>

      
    </div>
  );
}
