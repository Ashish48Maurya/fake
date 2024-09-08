"use client"
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import qrCode from 'qrcode'
import { useAuth } from '../context/context';
import toast from 'react-hot-toast';

export default function page() {
  const { state, address, loggedIn } = useAuth();
  const { contract } = state;
  const [productID, setProductID] = useState("");
  const [qrcode, setQRCode] = useState("");
  const [loading,setLoading] = useState(false);


  const generateQRCode = async () => {
    const url = await qrCode.toDataURL(`http://localhost:${productID}`);
    setQRCode(url);
    console.log(url);
  };

  const generateUniqueID = () => {
    return uuidv4();
  };

  useEffect(() => {
    const initializeProductData = async () => {
      setProductID(generateUniqueID());
      await generateQRCode();
    };
    initializeProductData();
  }, []);


  const convertQRCodeToPNG = (qrCodeUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = qrCodeUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        canvas.toBlob(blob => {
          resolve(new File([blob], 'qrcode.png', { type: 'image/png' }));
        }, 'image/png');
      };
      img.onerror = reject;
    });
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (qrcode && address) {
      try {
        // Check the user's role
        const role = await contract.getUserRole(address);
        if (role !== 0) { // Assuming Manufacturer role corresponds to 0
          toast.error("You must be a manufacturer to add a product.");
          return; // Exit the function if the user is not a manufacturer
        }

        // Upload QR code to IPFS
        const qrCodeUrl = await qrCode.toDataURL(productID);
        const qrCodePng = await convertQRCodeToPNG(qrCodeUrl);
        const formData = new FormData();
        formData.append('file', qrCodePng);

        const resFile = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "post",
          body: formData,
          headers: {
            pinata_api_key: "2116f8d5d3eda0bd29e1",
            pinata_secret_api_key: "1858c1b96394993389570925ad7bb82be08f04f21d0d31a8520cf9738200b8f7",
          },
        });

        const data = await resFile.json();
        const ImgHash = data.IpfsHash;

        const transaction = await contract.uploadProduct(productID);
        await transaction.wait();
        toast.success("Product Added Successfully");

        const downloadLink = document.createElement('a');
        downloadLink.href = qrCodeUrl;
        downloadLink.download = `${productID}.png`;
        downloadLink.click();

      } catch (err) {
        toast.error(err.message);
      }
      finally{
        setLoading(false);
      }
    } else {
      toast.error("QR Code not Generated yet");
    }
  };


  return (
    <>

      <div className="flex flex-col items-center my-24">
        <h1 className="text-lg lg:text-2xl font-bold mb-4">Generate Product QR-Code</h1>

        <form className="w-full max-w-md">
          <div className="mb-4 mx-2">
            <label htmlFor="textInput" className="text-lg lg:text-2xl block text-white  font-bold mb-2">
              Product ID:
            </label>
            <input
              type="text"
              id="textInput"
              value={productID}
              className="text-black text-xl font-bold w-full px-3  py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>

        <div className="mt-8 p-3 border-2 border-dashed rounded-lg flex justify-center items-center w-full max-w-xs h-64">
          {productID && qrcode ? (
            <div className='mb-3'>
              <label htmlFor='qrcode' className="form-label">QR Code:</label>
              <div className='text-center'>
                <img src={qrcode} alt="" className="img-fluid" />
              </div>
            </div>
          ) : (
            <span className="text-gray-500">QR Code will appear here</span>
          )}
        </div>
        <div className='text-center mt-[20px]'>
          <button className={`text-bold  px-4 py-2 rounded-md font-bold  ${loggedIn ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-500 text-black cursor-not-allowed'
            }`} disabled={!loggedIn || loading} onClick={addProduct} >{loading ? "Processing..." : "Process & Download"}</button>
        </div>
      </div>


    </>
  );
}