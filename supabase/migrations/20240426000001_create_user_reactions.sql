-- Create user_reactions table
CREATE TABLE IF NOT EXISTS public.user_reactions (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_reactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read reactions
CREATE POLICY "Allow authenticated users to read reactions"
    ON public.user_reactions
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert/update reactions
CREATE POLICY "Allow authenticated users to insert/update reactions"
    ON public.user_reactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to delete their own reactions
CREATE POLICY "Allow authenticated users to delete their own reactions"
    ON public.user_reactions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id); 