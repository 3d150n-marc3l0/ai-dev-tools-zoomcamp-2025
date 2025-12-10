-- Create interview sessions table
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(8) NOT NULL UNIQUE,
  title TEXT DEFAULT 'Untitled Session',
  language VARCHAR(50) DEFAULT 'javascript',
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (interview sessions are public by code)
CREATE POLICY "Anyone can view sessions" 
ON public.interview_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create sessions" 
ON public.interview_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update sessions" 
ON public.interview_sessions 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interview_sessions_updated_at
BEFORE UPDATE ON public.interview_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_sessions;