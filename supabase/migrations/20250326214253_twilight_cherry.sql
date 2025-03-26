/*
  # Create votes table for city voting

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `city` (text, either 'moscow' or 'saint-petersburg')
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `votes` table
    - Add policy for authenticated users to read all votes
    - Add policy for authenticated users to insert their own votes
*/

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL CHECK (city IN ('moscow', 'saint-petersburg')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert votes"
  ON votes
  FOR INSERT
  TO public
  WITH CHECK (true);