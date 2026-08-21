import { useState, useContext } from "react";
import { WalletContext } from "../context/WalletContext";

export default function Deposit(){
  const { balance, requestDeposit } = useContext(WalletContext);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);

  const handlePay = () => {
    if(!amount || !name) return alert("Enter amount and MoMo name");
    requestDeposit(amount, name);
    setDone(true);
  }

  if(done) return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-green-600">Request Sent! ✅</h2>
      <p className="mt-4">Send <b>GHS {amount}</b> to <b>0203760807</b></p>
      <p>MoMo Name: ChrisFixBet</p>
      <p className="mt-4 text-sm">After sending, WhatsApp proof to <b>0203760807</b></p>
      <p className="mt-2">Your balance will be updated after approval.</p>
      <p className="mt-4">Current Balance: <b>GHS {balance}</b></p>
      <button onClick={()=>setDone(false)} className="mt-4 bg-black text-white px-4 py-2 rounded">Make Another Deposit</button>
    </div>
  )

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Deposit - Real Cedis 💰</h2>
      <p className="mt-2">Balance: <b>GHS {balance}</b></p>
      
      <div className="mt-6 bg-yellow-100 p-4 rounded">
        <p className="font-bold">Send MoMo to:</p>
        <p className="text-xl">0203760807</p>
        <p>Name: ChrisFixBet</p>
      </div>

      <input type="number" placeholder="Amount (GHS)" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full mt-4 p-3 border rounded" />
      <input type="text" placeholder="Your MoMo Name" value={name} onChange={e=>setName(e.target.value)} className="w-full mt-2 p-3 border rounded" />

      <button onClick={handlePay} className="w-full mt-4 bg-green-600 text-white p-3 rounded font-bold">I Have Sent The Money</button>
      
      <a href="https://wa.me/233203760807?text=Hi, I just deposited GHS " target="_blank" className="block text-center mt-3 text-green-600 underline">WhatsApp Proof to 0203760807</a>
    </div>
  )
}
