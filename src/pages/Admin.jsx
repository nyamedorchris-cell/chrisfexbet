import { useState, useContext } from "react";
import { WalletContext } from "../context/WalletContext";

export default function Admin(){
  const [pass, setPass] = useState("");
  const [logged, setLogged] = useState(false);
  const { deposits, approveDeposit, balance } = useContext(WalletContext);

  if(!logged) return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="font-bold text-xl">Admin Login</h2>
      <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full mt-4 p-3 border rounded" />
      <button onClick={()=> pass==="chris123" ? setLogged(true) : alert("Wrong! Use chris123")} className="w-full mt-2 bg-black text-white p-3 rounded">Login</button>
      <p className="text-xs mt-2">Default pass: chris123</p>
    </div>
  )

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Admin Panel - Total in system: GHS {balance}</h2>
      <p className="text-sm">Your MoMo: 0203760807</p>
      <div className="mt-6">
        {deposits.length===0 && <p>No deposits yet</p>}
        {deposits.map(d=>(
          <div key={d.id} className="border p-3 mb-2 rounded flex justify-between">
            <div>
              <p><b>GHS {d.amount}</b> - {d.momoName}</p>
              <p className="text-xs">{d.date} - {d.status}</p>
            </div>
            {d.status==="pending" ? <button onClick={()=>approveDeposit(d.id)} className="bg-green-600 text-white px-3 py-1 rounded h-fit">Approve</button> : <span className="text-green-600">✅ Approved</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
