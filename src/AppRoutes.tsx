import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { HomePage } from '@/pages/HomePage'
import { BrowsePage } from '@/pages/BrowsePage'
import { BookDetailsPage } from '@/pages/BookDetailsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { PublicProfilePage } from '@/pages/PublicProfilePage'
import { MyListingsPage } from '@/pages/MyListingsPage'
import { MyRequestsPage } from '@/pages/MyRequestsPage'
import { EditListingPage } from '@/pages/EditListingPage'
import { EditRequestPage } from '@/pages/EditRequestPage'
import { RequestsPage } from '@/pages/RequestsPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { SellPage } from '@/pages/SellPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { HelpPage } from '@/pages/HelpPage'
import { SafetyPage } from '@/pages/SafetyPage'
import { ContactPage } from '@/pages/ContactPage'

import { ProtectedRoute } from '@/components/ProtectedRoute'


export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/book/:id" element={<BookDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<PublicProfilePage />} />
        <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
        <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
        <Route path="/my-requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
        <Route path="/edit-request/:id" element={<ProtectedRoute><EditRequestPage /></ProtectedRoute>} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  )
} 