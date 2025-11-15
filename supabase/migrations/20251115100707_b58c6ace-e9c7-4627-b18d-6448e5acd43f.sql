-- Correction du warning security pour search_path
CREATE OR REPLACE FUNCTION add_months_to_date(base_date DATE, months_to_add INTEGER)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN base_date + (months_to_add || ' months')::INTERVAL;
END;
$$;