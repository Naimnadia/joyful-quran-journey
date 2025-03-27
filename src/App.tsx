
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProfileSelect from "./pages/ProfileSelect";
import Index from "./pages/Index";
import Record from "./pages/Record";
import Children from "./pages/Children";
import Gifts from "./pages/Gifts";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { GlobalStateProvider } from "./hooks/useGlobalState";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Just a short delay to ensure everything is ready
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-purple font-medium">Synchronisation des données...</p>
        </div>
      </div>
    );
  }

  return (
    <GlobalStateProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ProfileSelect />} />
              <Route path="/home" element={<Index />} />
              <Route path="/record/:date?" element={<Record />} />
              <Route path="/children" element={<Children />} />
              <Route path="/gifts" element={<Gifts />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalStateProvider>
  );
};

export default App;
