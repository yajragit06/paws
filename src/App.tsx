import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { CatalogueProvider } from "./hooks/useCatalogue";
import About from "./pages/About";
import Book from "./pages/Book";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";

export default function App() {
  return (
    <CatalogueProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="book" element={<Book />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CatalogueProvider>
  );
}
