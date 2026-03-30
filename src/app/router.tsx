import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/shared/components/guards/AuthGuard'
import { PermissionGuard } from '@/shared/components/guards/PermissionGuard'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { PatientListPage } from '@/modules/patients/pages/PatientListPage'
import { PatientDetailPage } from '@/modules/patients/pages/PatientDetailPage'
import { PatientFormPage } from '@/modules/patients/pages/PatientFormPage'
import { CompanyListPage } from '@/modules/companies/pages/CompanyListPage'
import { CompanyFormPage } from '@/modules/companies/pages/CompanyFormPage'
import { CompanyDetailPage } from '@/modules/companies/pages/CompanyDetailPage'
import { WorkerListPage } from '@/modules/workers/pages/WorkerListPage'
import { WorkerFormPage } from '@/modules/workers/pages/WorkerFormPage'
import { VisitListPage } from '@/modules/visits/pages/VisitListPage'
import { VisitDetailPage } from '@/modules/visits/pages/VisitDetailPage'
import { VisitFormPage } from '@/modules/visits/pages/VisitFormPage'
import { ContractListPage } from '@/modules/contracts/pages/ContractListPage'
import { ContractDetailPage } from '@/modules/contracts/pages/ContractDetailPage'
import { ContractFormPage } from '@/modules/contracts/pages/ContractFormPage'
import { UserListPage } from '@/modules/users/pages/UserListPage'
import { UserFormPage } from '@/modules/users/pages/UserFormPage'
import { UserPasswordPage } from '@/modules/users/pages/UserPasswordPage'
import { RolesPage } from '@/modules/roles/pages/RolesPage'
import { SettingsPage } from '@/modules/settings/pages/SettingsPage'
import { UnauthorizedPage } from '@/shared/components/ui/UnauthorizedPage'
import { RouteErrorPage } from '@/shared/components/ui/RouteErrorPage'
import { NotFoundPage } from '@/shared/components/ui/NotFoundPage'
import { CareSessionListPage } from '@/modules/careSessions/pages/CareSessionListPage'
import { CareSessionFormPage } from '@/modules/careSessions/pages/CareSessionFormPage'
import { CareSessionDetailPage } from '@/modules/careSessions/pages/CareSessionDetailPage'
import { ProgramListPage } from '@/modules/programs/pages/ProgramListPage'
import { ProgramFormPage } from '@/modules/programs/pages/ProgramFormPage'
import { ProgramDetailPage } from '@/modules/programs/pages/ProgramDetailPage'
import { ProgramWizardPage } from '@/modules/programs/pages/ProgramWizardPage'
import { AppointmentListPage } from '@/modules/appointments/pages/AppointmentListPage'
import { AppointmentFormPage } from '@/modules/appointments/pages/AppointmentFormPage'
import { AppointmentWizardPage } from '@/modules/appointments/pages/AppointmentWizardPage'
import { ServiceTypeListPage } from '@/modules/visits/pages/ServiceTypeListPage'
import { WorkerCalendarPage } from '@/modules/workers/pages/WorkerCalendarPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    element: <AuthGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },

          // Patients
          {
            path: 'patients',
            element: <PermissionGuard permission="patients:view" />,
            children: [
              { index: true, element: <PatientListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="patients:create" />,
                children: [{ index: true, element: <PatientFormPage /> }],
              },
              { path: ':id', element: <PatientDetailPage /> },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="patients:edit" />,
                children: [{ index: true, element: <PatientFormPage /> }],
              },
            ],
          },

          // Companies
          {
            path: 'companies',
            element: <PermissionGuard permission="companies:view" />,
            children: [
              { index: true, element: <CompanyListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="companies:create" />,
                children: [{ index: true, element: <CompanyFormPage /> }],
              },
              { path: ':id', element: <CompanyDetailPage /> },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="companies:edit" />,
                children: [{ index: true, element: <CompanyFormPage /> }],
              },
            ],
          },

          // Workers
          {
            path: 'workers',
            element: <PermissionGuard permission="workers:view" />,
            children: [
              { index: true, element: <WorkerListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="workers:create" />,
                children: [{ index: true, element: <WorkerFormPage /> }],
              },
              { path: 'calendar', element: <WorkerCalendarPage /> },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="workers:edit" />,
                children: [{ index: true, element: <WorkerFormPage /> }],
              },
            ],
          },

          // Agendas
          {
            path: 'agendas',
            element: <PermissionGuard permission="visits:view" />,
            children: [
              { index: true, element: <VisitListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="visits:create" />,
                children: [{ index: true, element: <VisitFormPage /> }],
              },
              { path: ':id', element: <VisitDetailPage /> },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="visits:edit" />,
                children: [{ index: true, element: <VisitFormPage /> }],
              },
            ],
          },

          {
            path: 'visits',
            element: <Navigate to="/agendas" replace />,
          },

          // Contracts
          {
            path: 'contracts',
            element: <PermissionGuard permission="contracts:view" />,
            children: [
              { index: true, element: <ContractListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="contracts:create" />,
                children: [{ index: true, element: <ContractFormPage /> }],
              },
              { path: ':id', element: <ContractDetailPage /> },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="contracts:edit" />,
                children: [{ index: true, element: <ContractFormPage /> }],
              },
            ],
          },

          // Care Sessions
          {
            path: 'care-sessions',
            element: <PermissionGuard permission="care_sessions:view" />,
            children: [
              { index: true, element: <CareSessionListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="care_sessions:create" />,
                children: [{ index: true, element: <CareSessionFormPage /> }],
              },
              { path: ':id', element: <CareSessionDetailPage /> },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="care_sessions:edit" />,
                children: [{ index: true, element: <CareSessionFormPage /> }],
              },
            ],
          },

          // Company programs
          {
            path: 'programs',
            element: <PermissionGuard permission="contracts:view" />,
            children: [
              { index: true, element: <ProgramListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="contracts:create" />,
                children: [{ index: true, element: <ProgramWizardPage /> }],
              },
              { path: ':id', element: <ProgramDetailPage /> },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="contracts:edit" />,
                children: [{ index: true, element: <ProgramFormPage /> }],
              },
            ],
          },

          // Individual appointments
          {
            path: 'appointments',
            element: <PermissionGuard permission="visits:view" />,
            children: [
              { index: true, element: <AppointmentListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="visits:create" />,
                children: [{ index: true, element: <AppointmentWizardPage /> }],
              },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="visits:edit" />,
                children: [{ index: true, element: <AppointmentFormPage /> }],
              },
            ],
          },

          // Service types maintainer
          {
            path: 'service-types',
            element: <PermissionGuard permission="care_sessions:view" />,
            children: [{ index: true, element: <ServiceTypeListPage /> }],
          },

          // System admin
          {
            path: 'users',
            element: <PermissionGuard permission="users:view" />,
            children: [
              { index: true, element: <UserListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="users:create" />,
                children: [{ index: true, element: <UserFormPage /> }],
              },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="users:edit" />,
                children: [{ index: true, element: <UserFormPage /> }],
              },
              {
                path: ':id/password',
                element: <PermissionGuard permission="users:edit" />,
                children: [{ index: true, element: <UserPasswordPage /> }],
              },
            ],
          },
          {
            path: 'roles',
            element: <PermissionGuard permission="roles:view" />,
            children: [{ index: true, element: <RolesPage /> }],
          },
          {
            path: 'settings',
            element: <PermissionGuard permission="settings:view" />,
            children: [{ index: true, element: <SettingsPage /> }],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
