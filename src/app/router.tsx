import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
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
import { AppointmentDetailPage } from '@/modules/appointments/pages/AppointmentDetailPage'
import { AppointmentFormPage } from '@/modules/appointments/pages/AppointmentFormPage'
import { AppointmentWizardPage } from '@/modules/appointments/pages/AppointmentWizardPage'
import { ServiceTypeListPage } from '@/modules/visits/pages/ServiceTypeListPage'
import { WorkerCalendarPage } from '@/modules/workers/pages/WorkerCalendarPage'
import { PublicSiteLayout } from '@/modules/marketingSite/components/PublicSiteLayout'
import { HomePage } from '@/modules/marketingSite/pages/HomePage'
import { AboutPage } from '@/modules/marketingSite/pages/AboutPage'
import { ServicesHubPage } from '@/modules/marketingSite/pages/ServicesHubPage'
import { ServiceDetailPage } from '@/modules/marketingSite/pages/ServiceDetailPage'
import { CompaniesPage } from '@/modules/marketingSite/pages/CompaniesPage'
import { BlogListPage } from '@/modules/marketingSite/pages/BlogListPage'
import { BlogDetailPage } from '@/modules/marketingSite/pages/BlogDetailPage'
import { ContactPage } from '@/modules/marketingSite/pages/ContactPage'
import { SocialLinksPage } from '@/modules/marketingSite/pages/SocialLinksPage'
import { ContentAdminLayout } from '@/modules/contentAdmin/components/ContentAdminLayout'
import { ContentDashboardPage } from '@/modules/contentAdmin/pages/ContentDashboardPage'
import { BlogPostsAdminPage } from '@/modules/contentAdmin/pages/BlogPostsAdminPage'
import { CategoriesAdminPage } from '@/modules/contentAdmin/pages/CategoriesAdminPage'
import { ServicesAdminPage } from '@/modules/contentAdmin/pages/ServicesAdminPage'
import { FaqAdminPage } from '@/modules/contentAdmin/pages/FaqAdminPage'
import { TestimonialsAdminPage } from '@/modules/contentAdmin/pages/TestimonialsAdminPage'
import { SeoAdminPage } from '@/modules/contentAdmin/pages/SeoAdminPage'
import { MediaAdminPage } from '@/modules/contentAdmin/pages/MediaAdminPage'
import { LeadsAdminPage } from '@/modules/contentAdmin/pages/LeadsAdminPage'
import { ContentSettingsAdminPage } from '@/modules/contentAdmin/pages/ContentSettingsAdminPage'

const legacyAppPrefixes = [
  '/dashboard',
  '/patients',
  '/companies',
  '/workers',
  '/agendas',
  '/visits',
  '/contracts',
  '/care-sessions',
  '/programs',
  '/appointments',
  '/service-types',
  '/users',
  '/roles',
  '/settings',
]

function LegacyAppRedirect() {
  const location = useLocation()
  const target = `/app${location.pathname}${location.search}${location.hash}`
  const isLegacyAppPath = legacyAppPrefixes.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
  )

  if (isLegacyAppPath) {
    return <Navigate to={target} replace />
  }

  return <Navigate to="/" replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicSiteLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'nosotros', element: <AboutPage /> },
      { path: 'servicios', element: <ServicesHubPage /> },
      { path: 'servicios/ergonomia-laboral', element: <Navigate to="/servicios/bienestar-empresarial" replace /> },
      { path: 'servicios/:slug', element: <ServiceDetailPage /> },
      { path: 'empresas', element: <CompaniesPage /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/checklist-ergonomico-en-bodegas', element: <Navigate to="/blog/checklist-bienestar-empresarial-en-bodegas" replace /> },
      { path: 'blog/:slug', element: <BlogDetailPage /> },
      { path: 'contacto', element: <ContactPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/r',
    element: <SocialLinksPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/links',
    element: <Navigate to="/r" replace />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
    errorElement: <RouteErrorPage />,
  },
  {
    element: <AuthGuard />,
    errorElement: <RouteErrorPage />,
    path: '/app',
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
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
            element: <PermissionGuard permission="appointments:view" />,
            children: [
              { index: true, element: <AppointmentListPage /> },
              {
                path: 'new',
                element: <PermissionGuard permission="appointments:create" />,
                children: [{ index: true, element: <AppointmentWizardPage /> }],
              },
              { path: ':id', element: <AppointmentDetailPage /> },
              {
                path: ':id/edit',
                element: <PermissionGuard permission="appointments:edit" />,
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
          {
            path: 'content',
            element: <PermissionGuard permission="settings:view" />,
            children: [
              {
                element: <ContentAdminLayout />,
                children: [
                  { index: true, element: <ContentDashboardPage /> },
                  { path: 'posts', element: <BlogPostsAdminPage /> },
                  { path: 'categories', element: <CategoriesAdminPage /> },
                  { path: 'services', element: <ServicesAdminPage /> },
                  { path: 'faqs', element: <FaqAdminPage /> },
                  { path: 'testimonials', element: <TestimonialsAdminPage /> },
                  { path: 'seo', element: <SeoAdminPage /> },
                  { path: 'media', element: <MediaAdminPage /> },
                  { path: 'leads', element: <LeadsAdminPage /> },
                  { path: 'settings', element: <ContentSettingsAdminPage /> },
                ],
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <LegacyAppRedirect /> },
])
