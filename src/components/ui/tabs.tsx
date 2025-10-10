import React, { ReactNode, useState, useContext, createContext } from "react";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (v: string) => void;
};
const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs = ({ defaultValue, children, className }: { defaultValue: string; children: ReactNode; className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const TabsTrigger = ({ value, children, className }: { value: string; children: ReactNode; className?: string }) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs");
  const { activeTab, setActiveTab } = ctx;
  return (
    <button
      className={className + (activeTab === value ? " bg-blue-500 text-white" : "")}
      onClick={() => setActiveTab(value)}
      type="button"
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }: { value: string; children: ReactNode; className?: string }) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used within Tabs");
  const { activeTab } = ctx;
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};
