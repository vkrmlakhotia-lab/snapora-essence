import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { BookProvider } from "@/context/BookContext";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import HomePage from "./pages/HomePage.tsx";
import CreateBook from "./pages/CreateBook.tsx";
import Editor from "./pages/Editor.tsx";
import Preview from "./pages/Preview.tsx";
import Checkout from "./pages/Checkout.tsx";
import Creations from "./pages/Creations.tsx";
import Basket from "./pages/Basket.tsx";
import Account from "./pages/Account.tsx";
import OrderTracking from "./pages/OrderTracking.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BookProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/create" element={<CreateBook />} />
              <Route path="/editor/:id" element={<Editor />} />
              <Route path="/preview/:id" element={<Preview />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/creations" element={<Creations />} />
              <Route path="/basket" element={<Basket />} />
              <Route path="/account" element={<Account />} />
              <Route path="/order-tracking" element={<OrderTracking />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </BrowserRouter>
        </BookProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
