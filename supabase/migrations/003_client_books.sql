-- Migration: Client Books — coleção de páginas (doc + kanban) que o admin cria
-- para uma empresa cliente. Substitui o uso do Notion externo.
-- Data: 2026-07-05

-- ============================================
-- 1. Books (1 book pertence a 1 empresa)
-- ============================================
CREATE TABLE IF NOT EXISTS client_books (
  id TEXT PRIMARY KEY,
  -- company_id como TEXT sem FK (companies.id é UUID em produção, mesmo motivo
  -- do checklist na migration 002).
  company_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_emoji TEXT DEFAULT '📘',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_books_company ON client_books(company_id, status);

-- ============================================
-- 2. Páginas do book (doc rich text OU kanban board)
-- ============================================
CREATE TABLE IF NOT EXISTS book_pages (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES client_books(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Página sem título',
  icon TEXT DEFAULT '📄',
  page_type TEXT NOT NULL DEFAULT 'doc' CHECK (page_type IN ('doc', 'kanban')),
  -- doc: { "html": "..." }
  -- kanban: { "columns": [{ "id": "..", "title": "..", "cards": [{ "id": "..", "title": "..", "description": ".." }] }] }
  content JSONB DEFAULT '{}'::jsonb,
  "order" INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_book_pages_book ON book_pages(book_id, "order");

-- ============================================
-- 3. RLS
-- ============================================
ALTER TABLE client_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;

-- Books: leitura restrita à empresa do usuário (ou admin);
-- criação/edição/exclusão só admin.
DROP POLICY IF EXISTS "Read client_books by company" ON client_books;
CREATE POLICY "Read client_books by company" ON client_books FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND (company_id::text = client_books.company_id OR role = 'admin')
  )
);
DROP POLICY IF EXISTS "Write client_books admin only" ON client_books;
CREATE POLICY "Write client_books admin only" ON client_books FOR ALL USING (
  auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
) WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Pages: leitura pela empresa dona do book (via join); UPDATE também liberado
-- pra empresa (cliente atualiza kanban/notas); INSERT e DELETE apenas admin.
DROP POLICY IF EXISTS "Read book_pages by company" ON book_pages;
CREATE POLICY "Read book_pages by company" ON book_pages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_books b
    JOIN profiles p ON p.id = auth.uid()
    WHERE b.id = book_pages.book_id
      AND (b.company_id = p.company_id::text OR p.role = 'admin')
  )
);
DROP POLICY IF EXISTS "Update book_pages by company" ON book_pages;
CREATE POLICY "Update book_pages by company" ON book_pages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM client_books b
    JOIN profiles p ON p.id = auth.uid()
    WHERE b.id = book_pages.book_id
      AND (b.company_id = p.company_id::text OR p.role = 'admin')
  )
);
DROP POLICY IF EXISTS "Insert book_pages admin only" ON book_pages;
CREATE POLICY "Insert book_pages admin only" ON book_pages FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Delete book_pages admin only" ON book_pages;
CREATE POLICY "Delete book_pages admin only" ON book_pages FOR DELETE USING (
  auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
