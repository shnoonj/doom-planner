import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  "https://jcpjacauowqgiduqhnol.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcGphY2F1b3dxZ2lkdXFobm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDg5NjksImV4cCI6MjA5MzgyNDk2OX0.5hz14SlNMG-4LeNRk41J1xoThF8N-xv--HLG-5tYfPo"
)