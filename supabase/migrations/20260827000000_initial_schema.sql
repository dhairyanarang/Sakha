-- Sakha — baseline schema
--
-- Captured from the live project (yfuihfgvheavodrzxiwh, ap-south-1) with
-- pg_dump --schema-only over the session pooler. This is a RECORD of a
-- database that already exists, not a change to apply to it: the hosted
-- project is already in this state, so mark it applied rather than pushing it.
--
--   supabase migration repair --status applied 20260827000000
--
-- Everything below public/private is Postgres's own output, unmodified except
-- for two replayability fixes: the psql-only \restrict wrapper is stripped,
-- and both CREATE SCHEMA statements are IF NOT EXISTS so this can run against
-- a fresh Supabase project where public already exists.
--
-- The final section is hand-assembled because it lives outside the dumped
-- schemas: the auth.users trigger, the storage bucket, and the four
-- storage.objects policies. Each is Postgres's own canonical expression, read
-- from pg_get_triggerdef and pg_policies.

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: private; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS private;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: account_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_role AS ENUM (
    'owner',
    'family'
);


--
-- Name: measurement_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.measurement_type AS ENUM (
    'blood_pressure',
    'blood_sugar',
    'weight'
);


--
-- Name: medication_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.medication_status AS ENUM (
    'confirmed',
    'skipped',
    'unconfirmed'
);


--
-- Name: mood_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.mood_level AS ENUM (
    'not_good',
    'good',
    'very_good'
);


--
-- Name: time_of_day; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.time_of_day AS ENUM (
    'morning',
    'afternoon',
    'evening'
);


--
-- Name: is_account_member(uuid); Type: FUNCTION; Schema: private; Owner: -
--

CREATE FUNCTION private.is_account_member(a uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.account_members m
    where m.account_id = a and m.user_id = auth.uid()
  );
$$;


--
-- Name: is_account_owner(uuid); Type: FUNCTION; Schema: private; Owner: -
--

CREATE FUNCTION private.is_account_owner(a uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1 from public.account_members m
    where m.account_id = a and m.user_id = auth.uid() and m.role = 'owner'
  );
$$;


--
-- Name: create_account(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_account(p_display_name text, p_language text DEFAULT 'en'::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.accounts (display_name, language)
  values (p_display_name, coalesce(p_language, 'en'))
  returning id into v_id;
  insert into public.account_members (account_id, user_id, role)
  values (v_id, auth.uid(), 'owner');
  return v_id;
end $$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_members (
    account_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.account_role NOT NULL,
    relation text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    display_name text NOT NULL,
    language text DEFAULT 'en'::text NOT NULL,
    timezone text DEFAULT 'Asia/Kolkata'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT accounts_language_check CHECK ((language = ANY (ARRAY['en'::text, 'hi'::text])))
);


--
-- Name: daily_checkins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_checkins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    local_date date NOT NULL,
    mood public.mood_level NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: health_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    title text NOT NULL,
    doc_date date,
    doc_type text,
    storage_path text NOT NULL,
    notes text,
    source text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: health_measurements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_measurements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    type public.measurement_type NOT NULL,
    value numeric NOT NULL,
    value_secondary numeric,
    unit text NOT NULL,
    measured_at timestamp with time zone DEFAULT now() NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bp_has_two_numbers CHECK (((type = 'blood_pressure'::public.measurement_type) = (value_secondary IS NOT NULL)))
);


--
-- Name: medication_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medication_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    medication_id uuid NOT NULL,
    local_date date NOT NULL,
    slot public.time_of_day NOT NULL,
    status public.medication_status NOT NULL,
    confirmed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: medications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    name text NOT NULL,
    times_of_day public.time_of_day[] NOT NULL,
    condition_tag text,
    remarks text,
    archived_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT medications_times_of_day_check CHECK ((cardinality(times_of_day) >= 1))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    account_id uuid NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: trusted_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trusted_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    name text NOT NULL,
    relation text,
    phone text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: walk_checkins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.walk_checkins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_id uuid NOT NULL,
    local_date date NOT NULL,
    did_walk boolean NOT NULL,
    duration_minutes integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT walk_checkins_duration_minutes_check CHECK (((duration_minutes IS NULL) OR (duration_minutes > 0)))
);


--
-- Name: account_members account_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_members
    ADD CONSTRAINT account_members_pkey PRIMARY KEY (account_id, user_id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: daily_checkins daily_checkins_account_id_local_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_checkins
    ADD CONSTRAINT daily_checkins_account_id_local_date_key UNIQUE (account_id, local_date);


--
-- Name: daily_checkins daily_checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_checkins
    ADD CONSTRAINT daily_checkins_pkey PRIMARY KEY (id);


--
-- Name: health_documents health_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_documents
    ADD CONSTRAINT health_documents_pkey PRIMARY KEY (id);


--
-- Name: health_measurements health_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_measurements
    ADD CONSTRAINT health_measurements_pkey PRIMARY KEY (id);


--
-- Name: medication_logs medication_logs_medication_id_local_date_slot_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medication_logs
    ADD CONSTRAINT medication_logs_medication_id_local_date_slot_key UNIQUE (medication_id, local_date, slot);


--
-- Name: medication_logs medication_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medication_logs
    ADD CONSTRAINT medication_logs_pkey PRIMARY KEY (id);


--
-- Name: medications medications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: trusted_contacts trusted_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trusted_contacts
    ADD CONSTRAINT trusted_contacts_pkey PRIMARY KEY (id);


--
-- Name: walk_checkins walk_checkins_account_id_local_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.walk_checkins
    ADD CONSTRAINT walk_checkins_account_id_local_date_key UNIQUE (account_id, local_date);


--
-- Name: walk_checkins walk_checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.walk_checkins
    ADD CONSTRAINT walk_checkins_pkey PRIMARY KEY (id);


--
-- Name: account_members_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX account_members_user_id_idx ON public.account_members USING btree (user_id);


--
-- Name: health_documents_account_id_doc_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX health_documents_account_id_doc_date_idx ON public.health_documents USING btree (account_id, doc_date DESC);


--
-- Name: health_measurements_account_id_type_measured_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX health_measurements_account_id_type_measured_at_idx ON public.health_measurements USING btree (account_id, type, measured_at DESC);


--
-- Name: medication_logs_account_id_local_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX medication_logs_account_id_local_date_idx ON public.medication_logs USING btree (account_id, local_date);


--
-- Name: medications_account_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX medications_account_id_idx ON public.medications USING btree (account_id) WHERE (archived_at IS NULL);


--
-- Name: push_subscriptions_account_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX push_subscriptions_account_id_idx ON public.push_subscriptions USING btree (account_id);


--
-- Name: trusted_contacts_account_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trusted_contacts_account_id_idx ON public.trusted_contacts USING btree (account_id);


--
-- Name: account_members account_members_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_members
    ADD CONSTRAINT account_members_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: account_members account_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_members
    ADD CONSTRAINT account_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: daily_checkins daily_checkins_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_checkins
    ADD CONSTRAINT daily_checkins_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: health_documents health_documents_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_documents
    ADD CONSTRAINT health_documents_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: health_measurements health_measurements_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_measurements
    ADD CONSTRAINT health_measurements_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: medication_logs medication_logs_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medication_logs
    ADD CONSTRAINT medication_logs_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: medication_logs medication_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medication_logs
    ADD CONSTRAINT medication_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: medication_logs medication_logs_medication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medication_logs
    ADD CONSTRAINT medication_logs_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES public.medications(id) ON DELETE CASCADE;


--
-- Name: medications medications_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: push_subscriptions push_subscriptions_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: push_subscriptions push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: trusted_contacts trusted_contacts_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trusted_contacts
    ADD CONSTRAINT trusted_contacts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: walk_checkins walk_checkins_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.walk_checkins
    ADD CONSTRAINT walk_checkins_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: account_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;

--
-- Name: accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: accounts accounts_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accounts_select ON public.accounts FOR SELECT TO authenticated USING (private.is_account_member(id));


--
-- Name: accounts accounts_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY accounts_update ON public.accounts FOR UPDATE TO authenticated USING (private.is_account_owner(id)) WITH CHECK (private.is_account_owner(id));


--
-- Name: daily_checkins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_checkins daily_checkins_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY daily_checkins_all ON public.daily_checkins TO authenticated USING (private.is_account_member(account_id)) WITH CHECK (private.is_account_member(account_id));


--
-- Name: health_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: health_documents health_documents_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY health_documents_all ON public.health_documents TO authenticated USING (private.is_account_member(account_id)) WITH CHECK (private.is_account_member(account_id));


--
-- Name: health_measurements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_measurements ENABLE ROW LEVEL SECURITY;

--
-- Name: health_measurements health_measurements_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY health_measurements_all ON public.health_measurements TO authenticated USING (private.is_account_member(account_id)) WITH CHECK (private.is_account_member(account_id));


--
-- Name: medication_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: medication_logs medication_logs_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY medication_logs_all ON public.medication_logs TO authenticated USING (private.is_account_member(account_id)) WITH CHECK (private.is_account_member(account_id));


--
-- Name: medications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

--
-- Name: medications medications_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY medications_all ON public.medications TO authenticated USING (private.is_account_member(account_id)) WITH CHECK (private.is_account_member(account_id));


--
-- Name: account_members members_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY members_delete ON public.account_members FOR DELETE TO authenticated USING ((private.is_account_owner(account_id) OR (user_id = auth.uid())));


--
-- Name: account_members members_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY members_insert ON public.account_members FOR INSERT TO authenticated WITH CHECK (private.is_account_owner(account_id));


--
-- Name: account_members members_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY members_select ON public.account_members FOR SELECT TO authenticated USING (private.is_account_member(account_id));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (((id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (public.account_members mine
     JOIN public.account_members theirs ON ((theirs.account_id = mine.account_id)))
  WHERE ((mine.user_id = auth.uid()) AND (theirs.user_id = profiles.id))))));


--
-- Name: profiles profiles_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));


--
-- Name: push_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: push_subscriptions push_subscriptions_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY push_subscriptions_all ON public.push_subscriptions TO authenticated USING (private.is_account_member(account_id)) WITH CHECK (private.is_account_member(account_id));


--
-- Name: trusted_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: trusted_contacts trusted_contacts_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trusted_contacts_all ON public.trusted_contacts TO authenticated USING (private.is_account_member(account_id)) WITH CHECK (private.is_account_member(account_id));


--
-- Name: walk_checkins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.walk_checkins ENABLE ROW LEVEL SECURITY;

--
-- Name: walk_checkins walk_checkins_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY walk_checkins_all ON public.walk_checkins TO authenticated USING (private.is_account_member(account_id)) WITH CHECK (private.is_account_member(account_id));


--
-- Name: SCHEMA private; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA private TO authenticated;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION is_account_member(a uuid); Type: ACL; Schema: private; Owner: -
--

GRANT ALL ON FUNCTION private.is_account_member(a uuid) TO authenticated;


--
-- Name: FUNCTION is_account_owner(a uuid); Type: ACL; Schema: private; Owner: -
--

GRANT ALL ON FUNCTION private.is_account_owner(a uuid) TO authenticated;


--
-- Name: FUNCTION create_account(p_display_name text, p_language text); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.create_account(p_display_name text, p_language text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_account(p_display_name text, p_language text) TO authenticated;
GRANT ALL ON FUNCTION public.create_account(p_display_name text, p_language text) TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: TABLE account_members; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.account_members TO anon;
GRANT ALL ON TABLE public.account_members TO authenticated;
GRANT ALL ON TABLE public.account_members TO service_role;


--
-- Name: TABLE accounts; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.accounts TO anon;
GRANT ALL ON TABLE public.accounts TO authenticated;
GRANT ALL ON TABLE public.accounts TO service_role;


--
-- Name: TABLE daily_checkins; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.daily_checkins TO anon;
GRANT ALL ON TABLE public.daily_checkins TO authenticated;
GRANT ALL ON TABLE public.daily_checkins TO service_role;


--
-- Name: TABLE health_documents; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.health_documents TO anon;
GRANT ALL ON TABLE public.health_documents TO authenticated;
GRANT ALL ON TABLE public.health_documents TO service_role;


--
-- Name: TABLE health_measurements; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.health_measurements TO anon;
GRANT ALL ON TABLE public.health_measurements TO authenticated;
GRANT ALL ON TABLE public.health_measurements TO service_role;


--
-- Name: TABLE medication_logs; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.medication_logs TO anon;
GRANT ALL ON TABLE public.medication_logs TO authenticated;
GRANT ALL ON TABLE public.medication_logs TO service_role;


--
-- Name: TABLE medications; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.medications TO anon;
GRANT ALL ON TABLE public.medications TO authenticated;
GRANT ALL ON TABLE public.medications TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE push_subscriptions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.push_subscriptions TO anon;
GRANT ALL ON TABLE public.push_subscriptions TO authenticated;
GRANT ALL ON TABLE public.push_subscriptions TO service_role;


--
-- Name: TABLE trusted_contacts; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.trusted_contacts TO anon;
GRANT ALL ON TABLE public.trusted_contacts TO authenticated;
GRANT ALL ON TABLE public.trusted_contacts TO service_role;


--
-- Name: TABLE walk_checkins; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.walk_checkins TO anon;
GRANT ALL ON TABLE public.walk_checkins TO authenticated;
GRANT ALL ON TABLE public.walk_checkins TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--



--
-- Objects outside the public and private schemas
--
-- pg_dump was scoped to -n public -n private, so the three groups below were
-- read out of the catalog separately. They are as much a part of this schema
-- as anything above.
--

--
-- Name: on_auth_user_created; Type: TRIGGER; Schema: auth
--
-- Mirrors a new auth user into public.profiles. Schema-qualified here, where
-- pg_get_triggerdef reported it bare, so it does not depend on search_path.
--

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: health-documents; Type: BUCKET; Schema: storage
--
-- Private. Health documents are never served over a public URL.
--

INSERT INTO storage.buckets (id, name, public)
VALUES ('health-documents', 'health-documents', false)
ON CONFLICT (id) DO NOTHING;


--
-- Name: documents_*; Type: POLICY; Schema: storage
--
-- The first path segment of the object name is the account id, so membership
-- is checked against that. All four are needed: an upsert that replaces an
-- existing document requires INSERT, SELECT and UPDATE together — with INSERT
-- alone it fails silently.
--

DROP POLICY IF EXISTS documents_read ON storage.objects;
CREATE POLICY documents_read ON storage.objects
    FOR SELECT TO authenticated
    USING (((bucket_id = 'health-documents'::text) AND private.is_account_member(((storage.foldername(name))[1])::uuid)));

DROP POLICY IF EXISTS documents_write ON storage.objects;
CREATE POLICY documents_write ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (((bucket_id = 'health-documents'::text) AND private.is_account_member(((storage.foldername(name))[1])::uuid)));

DROP POLICY IF EXISTS documents_update ON storage.objects;
CREATE POLICY documents_update ON storage.objects
    FOR UPDATE TO authenticated
    USING (((bucket_id = 'health-documents'::text) AND private.is_account_member(((storage.foldername(name))[1])::uuid)))
    WITH CHECK (((bucket_id = 'health-documents'::text) AND private.is_account_member(((storage.foldername(name))[1])::uuid)));

DROP POLICY IF EXISTS documents_delete ON storage.objects;
CREATE POLICY documents_delete ON storage.objects
    FOR DELETE TO authenticated
    USING (((bucket_id = 'health-documents'::text) AND private.is_account_member(((storage.foldername(name))[1])::uuid)));

--
-- Sakha baseline schema complete
--
