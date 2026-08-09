-- Migration 0004 — create reviews table
-- Stores customer testimonials/reviews submitted via POST /reviews.
-- Reviews require admin approval (approved=false) before public display.

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_company VARCHAR(255),
    customer_role VARCHAR(100),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(approved) WHERE approved = true;

-- RLS is disabled for this table (consistent with other backend-only tables)
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
