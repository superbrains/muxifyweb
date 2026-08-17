import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AdminApp } from './app/adminApp'
import { Provider } from "@/components/ui/provider"

// Entry point for the admin-only bundle (admin.html). The creator/fan app has
// its own entry in main.tsx — keep the two in sync when the provider stack
// changes, but never let this one import the creator route table.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <AdminApp />
    </Provider>
  </StrictMode>,
)
