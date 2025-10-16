import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PWAInstallPrompt from './components/ui/PWAInstallPrompt';
import LoadingScreen from './components/ui/LoadingScreen';

// Layouts
const Layout = lazy(() => import('./pages/Layout'));
const MoreCowbellLayout = lazy(() => import('./pages/more-cowbell/Layout'));

// Pages
const Home = lazy(() => import('./pages/Home'));
const Fridge = lazy(() => import('./pages/Fridge'));
const Admin = lazy(() => import('./pages/Admin'));
const MoreCowbellHome = lazy(() => import('./pages/more-cowbell/Home'));
const RoomPage = lazy(() => import('./pages/more-cowbell/room/RoomPage'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>

        <Route path="/fridge" element={<Layout />}>
          <Route index element={<Fridge />} />
        </Route>

        <Route path="/admin" element={<Layout />}>
          <Route index element={<Admin />} />
        </Route>

        <Route path="/more-cowbell" element={<MoreCowbellLayout />}>
          <Route index element={<MoreCowbellHome />} />
          <Route path="room/:room" element={<RoomPage />} />
        </Route>
      </Routes>
      <PWAInstallPrompt />
    </Suspense>
  );
}

export default App;
