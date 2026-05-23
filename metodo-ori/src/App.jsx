import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Produto2 = lazy(() => import("./pages/Produto2"));
const Produto3 = lazy(() => import("./pages/Produto3"));
const QuizProduto1 = lazy(() => import("./pages/QuizProduto1"));
const EspelhoOri = lazy(() => import("./pages/EspelhoOri"));
const MetodoOri = lazy(() => import("./pages/MetodoOri"));
const Login = lazy(() => import("./pages/Login"));
const OnboardingOri = lazy(() => import("./pages/OnboardingOri"));
const PortalCliente = lazy(() => import("./pages/PortalCliente"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminClientes = lazy(() => import("./pages/AdminClientes"));
const AdminClienteDetalhe = lazy(() => import("./pages/AdminClienteDetalhe"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function PageFallback() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-10 text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
        <div className="ori-card-secondary rounded-[28px] px-6 py-5 text-center">
          <p className="ori-label-line ori-type-system justify-center">ORI</p>
          <p className="mt-3 text-sm text-[var(--ori-reading)]">Abrindo sua jornada...</p>
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/entrar" element={<Login />} />

          <Route
            path="/entrada-ori"
            element={
              <ProtectedRoute>
                <OnboardingOri />
              </ProtectedRoute>
            }
          />

          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PortalCliente />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/clientes"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <DashboardLayout>
                    <AdminClientes />
                  </DashboardLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/clientes/:id"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <DashboardLayout>
                    <AdminClienteDetalhe />
                  </DashboardLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/produto-1"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <QuizProduto1 />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/metodo-ori"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MetodoOri />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/produto-1/leitura"
            element={
              <ProtectedRoute>
                <QuizProduto1 />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz-produto-1"
            element={
              <ProtectedRoute>
                <QuizProduto1 />
              </ProtectedRoute>
            }
          />

          <Route
            path="/produto-2"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Produto2 />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/produto-3"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Produto3 />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/espelho-ori"
            element={
              <ProtectedRoute>
                <EspelhoOri />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
