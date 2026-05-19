import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Produto2 from "./pages/Produto2";
import Produto3 from "./pages/Produto3";
import QuizProduto1 from "./pages/QuizProduto1";
import EspelhoOri from "./pages/EspelhoOri";
import MetodoOri from "./pages/MetodoOri";

import Login from "./pages/Login";
import PortalCliente from "./pages/PortalCliente";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClientes from "./pages/AdminClientes";
import AdminClienteDetalhe from "./pages/AdminClienteDetalhe";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/entrar" element={<Login />} />

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
    </BrowserRouter>
  );
}

export default App;
