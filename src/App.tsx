import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AmbientGlow } from '@/components/ui/AmbientGlow'
import { AnimatedLayout } from '@/components/layout/AnimatedLayout'
import { Skeleton } from '@/components/ui/Skeleton'
import { Gifteddy } from '@/components/gifteddy/Gifteddy'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'

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
const AiEnthusiast = lazy(() => import('@/pages/AiEnthusiast'))
const PhotoEditing = lazy(() => import('@/pages/PhotoEditing'))
const About = lazy(() => import('@/pages/About'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminProjects = lazy(() => import('@/pages/admin/AdminProjects'))
const AdminMedia = lazy(() => import('@/pages/admin/AdminMedia'))
const AdminMessages = lazy(() => import('@/pages/admin/AdminMessages'))
const AdminBlog = lazy(() => import('@/pages/admin/AdminBlog'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))

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
  return (
    <>
      <AmbientGlow />
      <Gifteddy />
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
            <Route path="ai-enthusiast" element={<AiEnthusiast />} />
            <Route path="photo-editing" element={<PhotoEditing />} />
            <Route path="frontend-development" element={<Navigate to="/development" replace />} />
            <Route path="full-stack-development" element={<Navigate to="/development" replace />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
