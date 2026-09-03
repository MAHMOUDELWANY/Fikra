DELETE FROM public.leads a USING public.leads b
WHERE lower(a.email) = lower(b.email) AND a.created_at < b.created_at;
