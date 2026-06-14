import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import DrinkPage from './pages/DrinkPage';
import NewReviewPage from './pages/NewReviewPage';
import DashboardPage from './pages/DashboardPage';
import SuggestPage from './pages/SuggestPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="shop/:id" element={<ShopPage />} />
            <Route path="drink/:id" element={<DrinkPage />} />
            <Route path="new-review" element={<NewReviewPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="suggest" element={<SuggestPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
