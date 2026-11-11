import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Dashboard from './pages/Dashboard/Dashboard'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Acceuil from './pages/Dashboard/components/Menu/Acceuil/Acceuil'
import Produit from './pages/Dashboard/components/Menu/Produit/Produit'
import EntréeSortie from './pages/Dashboard/components/Menu/EntréeSortie/EntréeSortie'
import Fournisseurs from './pages/Dashboard/components/Menu/Fournisseurs/Fournisseurs'
import Commandes from './pages/Dashboard/components/Menu/Commandes/Commandes'
import Auth from './pages/Authentication/Auth'
import Login from './pages/Authentication/Login/Login'
import Signup from './pages/Authentication/Signup/Signup'
import CommandesForm from './pages/Dashboard/components/Menu/Commandes/CommandesForm'
import Profil from './pages/Dashboard/components/Menu/Profil/Profil'
import Settings from './pages/Dashboard/components/Menu/Settings/settings'
import ProtectedRoute from './routes/ProtectedRoute'
import Unauthorized from './pages/Error/unauthorized/unAuthorized'
import SessionExpired from './pages/Error/expired/SessionExpired'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthProvider'
import NotFound from './pages/Error/404/NotFound'
import AdminRoute from './routes/AdminRoute'
import UpdtLinCom from './pages/Dashboard/components/Menu/Commandes/UpdtLinCom'
import { DeviseProvider } from './context/DeviseProvider'

const route = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
     children: [
       {
         index: true,
         element: <Navigate to="login" />
       },
       {
         path: "login",
         element: <Login />
       },
       {
         path: "signup",
         element: <Signup />
       }
     ]
  },
  {
    path: "/session-expired",
    element: <SessionExpired />
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />
  },
  {
    element: <ProtectedRoute />,
    children: [  
      {
        path: "/",
        element: <Dashboard />,
        children: [
          {
            index: true,
            element: <Navigate to="acceuil" />
          },
          {
            path: "/acceuil",
            element: <Acceuil />
          },
          {
            path: "/profil",
            element: <Profil />
          },
          {
            path: "/produit",
            element: <Produit />
          },
          {
            element: <AdminRoute/>,
            children:[
              {
                path: "/settings",
                element: <Settings />   
              }
            ]
          },
          {
            path: "/mouvement-stock",
            element: <EntréeSortie />
          },
          {
            path: "/fournisseur",
            element: <Fournisseurs />
          },
          {
            path: "/commande",
            element: <Commandes />
          },
          {
            path: "/commande-edit/:id",
            element: <UpdtLinCom />
          },
          {
            path: "/commande-form",
            element: <CommandesForm />
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <NotFound />
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DeviseProvider>
        <Toaster position='top-right' toastOptions={{duration: 3000}}/>
        <RouterProvider router={route}/>
      </DeviseProvider>
    </AuthProvider>
  </StrictMode>,
)
