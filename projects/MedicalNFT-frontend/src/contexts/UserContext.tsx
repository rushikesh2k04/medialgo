import React, { createContext, useContext, useState } from "react";

type UserProfile = {
  name: string;
  speciality?: string;
  license?: string;
  age?: number;
  phone?: string;
  email?: string;
};

type UserContextType = {
  role: "doctor" | "patient" | "pharmacy" | null;
  setRole: (role: UserContextType["role"]) => void;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  walletAddress: string | null;
  setWalletAddress: (address: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserContextType["role"]>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ role, setRole, profile, setProfile, walletAddress, setWalletAddress }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
