import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { AmbientGlow } from '@/components/ui/AmbientGlow'
import { AnimatedLayout } from '@/components/layout/AnimatedLayout'
import { Skeleton } from '@/components/ui/Skeleton'
import { Gifteddy } from '@/components/gifteddy/Gifteddy'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { PartnerProtectedRoute } from '@/components/partner/PartnerProtectedRoute'
import PartnerLayout from '@/components/partner/PartnerLayout'
import { AdminOverlay } from '@/components/admin/AdminOverlay'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastContainer } from '@/components/ui/Toast'
import Offline from '@/pages/Offline'

const Home = lazy(() => import('@/pages/Home'))
const Projects = lazy(() => import('@/pages/Projects'))
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'))
const Blog = lazy(() => import('@/pages/Blog'))
const BlogPost = lazy(() => import('@/pages/BlogPost'))
const Contact = lazy(() => import('@/pages/Contact'))
const Photography = lazy(() => import('@/pages/Photography'))
const VideoProduction = lazy(() => import('@/pages/VideoProduction'))
const GraphicDesign = lazy(() => import('@/pages/GraphicDesign'))
const Development = lazy(() => import('@/pages/Development'))
const PhotoEditing = lazy(() => import('@/pages/PhotoEditing'))
const SubmitTestimonial = lazy(() => import('@/pages/SubmitTestimonial'))
const FileUpload = lazy(() => import('@/pages/FileUpload'))
const FileShare = lazy(() => import('@/pages/FileShare'))
const About = lazy(() => import('@/pages/About'))
const Shop = lazy(() => import('@/pages/shop/Shop'))
const ShopDigitalProducts = lazy(() => import('@/pages/shop/DigitalProducts'))
const ShopMerch = lazy(() => import('@/pages/shop/Merch'))
const ShopBundles = lazy(() => import('@/pages/shop/Bundles'))
const ShopPartners = lazy(() => import('@/pages/shop/Partners'))
const ShopPartnerApply = lazy(() => import('@/pages/shop/PartnerApply'))
const ShopPartnerLogin = lazy(() => import('@/pages/shop/PartnerLogin'))
const ShopPartnerDashboard = lazy(() => import('@/pages/shop/PartnerDashboard'))
const ShopPartnerReferrals = lazy(() => import('@/pages/shop/PartnerReferrals'))
const ShopPartnerProducts = lazy(() => import('@/pages/shop/PartnerProducts'))
const ShopPartnerAnalytics = lazy(() => import('@/pages/shop/PartnerAnalytics'))
const ShopPartnerNotifications = lazy(() => import('@/pages/shop/PartnerNotifications'))
const ShopPartnerProfile = lazy(() => import('@/pages/shop/PartnerProfile'))
const ShopPartnerPayouts = lazy(() => import('@/pages/shop/PartnerPayouts'))
const ShopPartnerAchievements = lazy(() => import('@/pages/shop/PartnerAchievements'))
const ShopPartnerResources = lazy(() => import('@/pages/shop/PartnerResources'))
const ShopProductDetail = lazy(() => import('@/pages/shop/ProductDetail'))
const ShopCheckout = lazy(() => import('@/pages/shop/Checkout'))
const ShopOrderSuccess = lazy(() => import('@/pages/shop/OrderSuccess'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))

const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminProjects = lazy(() => import('@/pages/admin/AdminProjects'))
const AdminMedia = lazy(() => import('@/pages/admin/AdminMedia'))
const AdminMessages = lazy(() => import('@/pages/admin/AdminMessages'))
const AdminBlog = lazy(() => import('@/pages/admin/AdminBlog'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))
const AdminTestimonials = lazy(() => import('@/pages/admin/AdminTestimonials'))
const AdminFileUploads = lazy(() => import('@/pages/admin/AdminFileUploads'))
const AdminFileShares = lazy(() => import('@/pages/admin/AdminFileShares'))
const AdminCompanyLogos = lazy(() => import('@/pages/admin/AdminCompanyLogos'))
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'))
const AdminDiscounts = lazy(() => import('@/pages/admin/AdminDiscounts'))
const AdminStoreSettings = lazy(() => import('@/pages/admin/AdminStoreSettings'))
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'))
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminInventory = lazy(() => import('@/pages/admin/AdminInventory'))
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'))
const AdminPartners = lazy(() => import('@/pages/admin/AdminPartners'))
const AdminCommissions = lazy(() => import('@/pages/admin/AdminCommissions'))
const AdminPayouts = lazy(() => import('@/pages/admin/AdminPayouts'))
const AdminPartnerSettings = lazy(() => import('@/pages/admin/AdminPartnerSettings'))


function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-64 space-y-4">
        <Skeleton className="mx-auto h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

export default function App() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (!online) return <Offline />

  return (
    <ErrorBoundary>
      <AmbientGlow />
      <Gifteddy />
      <AdminOverlay />
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AnimatedLayout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="photography" element={<Photography />} />
            <Route path="video-production" element={<VideoProduction />} />
            <Route path="graphic-design" element={<GraphicDesign />} />
            <Route path="development" element={<Development />} />
            <Route path="photo-editing" element={<PhotoEditing />} />
            <Route path="frontend-development" element={<Navigate to="/development" replace />} />
            <Route path="full-stack-development" element={<Navigate to="/development" replace />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="submit-testimonial" element={<SubmitTestimonial />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shop/digital-products" element={<ShopDigitalProducts />} />
            <Route path="shop/merch" element={<ShopMerch />} />
            <Route path="shop/bundles" element={<ShopBundles />} />

            <Route path="shop/partners" element={<ShopPartners />} />
            <Route path="shop/partners/apply" element={<ShopPartnerApply />} />
            <Route path="shop/partners/login" element={<ShopPartnerLogin />} />

            <Route path="shop/product/:slug" element={<ShopProductDetail />} />
            <Route path="shop/checkout" element={<ShopCheckout />} />
            <Route path="shop/success/:id" element={<ShopOrderSuccess />} />
          </Route>

          <Route path="upload/:token" element={<FileUpload />} />
          <Route path="share/:token" element={<FileShare />} />

          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          <Route path="*" element={<NotFound />} />

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<PartnerProtectedRoute />}>
            <Route element={<PartnerLayout />}>
              <Route path="/shop/partners/dashboard" element={<ShopPartnerDashboard />} />
              <Route path="/shop/partners/referrals" element={<ShopPartnerReferrals />} />
              <Route path="/shop/partners/products" element={<ShopPartnerProducts />} />
              <Route path="/shop/partners/analytics" element={<ShopPartnerAnalytics />} />
              <Route path="/shop/partners/notifications" element={<ShopPartnerNotifications />} />
              <Route path="/shop/partners/profile" element={<ShopPartnerProfile />} />
              <Route path="/shop/partners/payouts" element={<ShopPartnerPayouts />} />
              <Route path="/shop/partners/achievements" element={<ShopPartnerAchievements />} />
              <Route path="/shop/partners/resources" element={<ShopPartnerResources />} />
              <Route path="/shop/partners/settings" element={<ShopPartnerProfile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="file-uploads" element={<AdminFileUploads />} />
              <Route path="file-shares" element={<AdminFileShares />} />
              <Route path="company-logos" element={<AdminCompanyLogos />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="discounts" element={<AdminDiscounts />} />
              <Route path="store-settings" element={<AdminStoreSettings />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="commissions" element={<AdminCommissions />} />
              <Route path="payouts" element={<AdminPayouts />} />
              <Route path="partner-settings" element={<AdminPartnerSettings />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
