import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth.context';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import PageNotFound from '@/pages/PageNotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import Department from '@/pages/Department';

import PatientFileSecretary from '@/pages/PatientFileSecretary';
import SecretaryDashboard from '@/pages/secretaryDashboard/SecretaryDashboard';
import ForgotPassword from '@/pages/ForgotPassword';
import User from '@/pages/User';
import Logs from '@/pages/Logs';
import CreateUser from '@/pages/CreateUser';
import NewAppointementByDoctor from './pages/NewAppointementByDoctor';
import NewAppointementByPatient from './pages/NewAppointementByPatient';
import Agent from '@/pages/Agent';
import ResetPassword from './pages/ResetPassword';
import DoctorAgendaPage from './pages/DoctorAgendaPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      },
      {
        path: '*',
        element: <PageNotFound />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: '/admin/users',
            element: <User />,
          },
          {
            path: '/admin/users/create',
            element: <CreateUser />,
          },
          {
            path: '/admin/logs',
            element: <Logs />,
          },
          {
            path: '/admin/department',
            element: <Department />,
          },
          {
            path: '/secretary',
            element: <SecretaryDashboard />,
          },
          {
            path: '/secretary/patient/:id',
            element: <PatientFileSecretary />,
          },
          {
            path: '/secretary/doctor/:id/appointment/create',
            element: <NewAppointementByDoctor />,
          },
          {
            path: '/secretary/doctor/:id/agenda',
            element: <DoctorAgendaPage />,
          },
          {
            path: '/secretary/patient/:id/appointment/create',
            element: <NewAppointementByPatient />,
          },
          {
            path: '/agent',
            element: <Agent />,
          },
          {
            path: '/doctor',
            element: <DoctorAgendaPage />,
          },
          {
            path: '/doctor/appointment/create',
            element: <NewAppointementByDoctor />,
          },
        ],
      },
    ],
  },
]);

const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

export default App;
