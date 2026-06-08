-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Bills table
CREATE TABLE bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('Introduced', 'Pending', 'Passed', 'Rejected')),
  department TEXT,
  date_introduced DATE,
  ai_summary_what TEXT,
  ai_summary_why TEXT,
  ai_summary_impact TEXT,
  document_url TEXT,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Representatives table
CREATE TABLE representatives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('MLA', 'MP')),
  party TEXT,
  constituency TEXT,
  district TEXT,
  attendance_rate NUMERIC,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill Timeline table
CREATE TABLE bill_timeline (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  stage_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_timeline ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust for production)
CREATE POLICY "Allow public read access to bills" ON bills FOR SELECT USING (true);
CREATE POLICY "Allow public read access to representatives" ON representatives FOR SELECT USING (true);
CREATE POLICY "Allow public read access to bill_timeline" ON bill_timeline FOR SELECT USING (true);

-- Function for semantic search
CREATE OR REPLACE FUNCTION match_bills(query_embedding vector(1536), match_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status TEXT,
  department TEXT,
  ai_summary_what TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bills.id,
    bills.title,
    bills.status,
    bills.department,
    bills.ai_summary_what,
    1 - (bills.embedding <=> query_embedding) AS similarity
  FROM bills
  ORDER BY bills.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;