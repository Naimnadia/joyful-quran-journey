
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalStateProvider } from "./hooks/useGlobalState";
import { toast } from "sonner";

// Pages
import ProfileSelect from "./pages/ProfileSelect";
import Index from "./pages/Index";
import Record from "./pages/Record";
import Children from "./pages/Children";
import Gifts from "./pages/Gifts";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  // Check for online/offline status for mobile
  useEffect(() => {
    const handleOnline = () => toast.success("Connection restored");
    const handleOffline = () => toast.error("Connection lost");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
