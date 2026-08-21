import { createContext, useState, useEffect } from "react";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(() => {
    return Number(localStorage.getItem("chrisfix_balance") || 0);
  });
  const [deposits, setDeposits] = useState(() => {
    return JSON.parse(localStorage.getItem("chrisfix_deposits") || "[]");
  });

  useEffect(() => {
    localStorage.setItem("chrisfix_balance", balance);
    localStorage.setItem("chrisfix_deposits", JSON.stringify(deposits));
  }, [balance, deposits]);

  const requestDeposit = (amount, momoName) => {
    const newDeposit = {
      id: Date.now(),
      amount: Number(amount),
      momoName,
      status: "pending",
      date: new Date().toLocaleString(),
      phone: "0203760807"
    };
    setDeposits([...deposits, newDeposit]);
  };

  const approveDeposit = (id) => {
    const dep = deposits.find(d => d.id === id);
    if(dep && dep.status === "pending"){
      setBalance(b => b + dep.amount);
      setDeposits(deposits.map(d => d.id === id ? {...d, status: "approved"} : d));
    }
  };

  return (
    <WalletContext.Provider value={{ balance, deposits, requestDeposit, approveDeposit, setDeposits }}>
      {children}
    </WalletContext.Provider>
  );
};
