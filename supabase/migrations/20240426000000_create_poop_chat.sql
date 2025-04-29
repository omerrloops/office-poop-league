-- Create poop_chat table
CREATE TABLE IF NOT EXISTS public.poop_chat (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.poop_chat ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read messages
CREATE POLICY "Allow authenticated users to read messages"
    ON public.poop_chat
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert messages
CREATE POLICY "Allow authenticated users to insert messages"
    ON public.poop_chat
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create index for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_poop_chat_created_at ON public.poop_chat(created_at); 