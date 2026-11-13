--
-- PostgreSQL database dump
--

\restrict PV80e7UshudDnSTwkzIZIFiXr4vidUUNS5Ui357TQLftYiGEFEFWBdQSOze4Ljv

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AgentAvailability; Type: TYPE; Schema: public; Owner: zadesk
--

CREATE TYPE public."AgentAvailability" AS ENUM (
    'AVAILABLE',
    'BUSY',
    'AWAY',
    'OFFLINE'
);


ALTER TYPE public."AgentAvailability" OWNER TO zadesk;

--
-- Name: ConversationStatus; Type: TYPE; Schema: public; Owner: zadesk
--

CREATE TYPE public."ConversationStatus" AS ENUM (
    'WAITING_ASSIGNMENT',
    'ACTIVE',
    'WAITING_CUSTOMER',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."ConversationStatus" OWNER TO zadesk;

--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: zadesk
--

CREATE TYPE public."MessageType" AS ENUM (
    'CUSTOMER',
    'AGENT_REPLY',
    'INTERNAL_NOTE',
    'SYSTEM'
);


ALTER TYPE public."MessageType" OWNER TO zadesk;

--
-- Name: OtpPurpose; Type: TYPE; Schema: public; Owner: zadesk
--

CREATE TYPE public."OtpPurpose" AS ENUM (
    'REGISTRATION',
    'LOGIN',
    'EMAIL_VERIFICATION',
    'PASSWORD_RESET'
);


ALTER TYPE public."OtpPurpose" OWNER TO zadesk;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: zadesk
--

CREATE TYPE public."Role" AS ENUM (
    'OWNER',
    'ADMIN',
    'MANAGER',
    'AGENT'
);


ALTER TYPE public."Role" OWNER TO zadesk;

--
-- Name: ShareAccessLevel; Type: TYPE; Schema: public; Owner: zadesk
--

CREATE TYPE public."ShareAccessLevel" AS ENUM (
    'READ_ONLY',
    'CONTRIBUTE'
);


ALTER TYPE public."ShareAccessLevel" OWNER TO zadesk;

--
-- Name: TicketPriority; Type: TYPE; Schema: public; Owner: zadesk
--

CREATE TYPE public."TicketPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."TicketPriority" OWNER TO zadesk;

--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: zadesk
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'PENDING_ASSIGNMENT',
    'OPEN',
    'IN_PROGRESS',
    'WAITING_CUSTOMER',
    'RESOLVED',
    'CLOSED'
);


ALTER TYPE public."TicketStatus" OWNER TO zadesk;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO zadesk;

--
-- Name: agent_profiles; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.agent_profiles (
    id text NOT NULL,
    "workspaceId" text NOT NULL,
    "userId" text NOT NULL,
    availability public."AgentAvailability" DEFAULT 'AVAILABLE'::public."AgentAvailability" NOT NULL,
    "maxCapacity" integer DEFAULT 10 NOT NULL,
    "autoAssignmentEnabled" boolean DEFAULT true NOT NULL,
    title text DEFAULT 'Agent SAV'::text,
    phone text,
    "notificationEmail" boolean DEFAULT true NOT NULL,
    "notificationApp" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.agent_profiles OWNER TO zadesk;

--
-- Name: agent_skills; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.agent_skills (
    id text NOT NULL,
    "agentProfileId" text NOT NULL,
    "skillId" text NOT NULL,
    "validatedById" text,
    "validatedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.agent_skills OWNER TO zadesk;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "workspaceId" text NOT NULL,
    "userId" text,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text NOT NULL,
    details jsonb,
    "ipAddress" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO zadesk;

--
-- Name: conversation_messages; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.conversation_messages (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text,
    "senderType" public."MessageType" DEFAULT 'CUSTOMER'::public."MessageType" NOT NULL,
    "senderName" text NOT NULL,
    content text NOT NULL,
    "isInternalNote" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversation_messages OWNER TO zadesk;

--
-- Name: conversation_shares; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.conversation_shares (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "agentId" text NOT NULL,
    "sharedById" text NOT NULL,
    "accessLevel" public."ShareAccessLevel" DEFAULT 'READ_ONLY'::public."ShareAccessLevel" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversation_shares OWNER TO zadesk;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.conversations (
    id text NOT NULL,
    "workspaceId" text NOT NULL,
    "assignedAgentId" text,
    "customerName" text NOT NULL,
    "customerPhone" text,
    "customerEmail" text,
    channel text DEFAULT 'PORTAL'::text NOT NULL,
    status public."ConversationStatus" DEFAULT 'ACTIVE'::public."ConversationStatus" NOT NULL,
    priority public."TicketPriority" DEFAULT 'MEDIUM'::public."TicketPriority" NOT NULL,
    "lastMessageAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.conversations OWNER TO zadesk;

--
-- Name: memberships; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.memberships (
    id text NOT NULL,
    "userId" text NOT NULL,
    "workspaceId" text NOT NULL,
    role public."Role" DEFAULT 'AGENT'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.memberships OWNER TO zadesk;

--
-- Name: onboarding_drafts; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.onboarding_drafts (
    id text NOT NULL,
    "userId" text NOT NULL,
    step integer DEFAULT 1 NOT NULL,
    data jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.onboarding_drafts OWNER TO zadesk;

--
-- Name: otp_tokens; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.otp_tokens (
    id text NOT NULL,
    "userId" text NOT NULL,
    "otpHash" text NOT NULL,
    purpose public."OtpPurpose" DEFAULT 'LOGIN'::public."OtpPurpose" NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "maxAttempts" integer DEFAULT 5 NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.otp_tokens OWNER TO zadesk;

--
-- Name: pending_registrations; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.pending_registrations (
    id text NOT NULL,
    email text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "passwordHash" text NOT NULL,
    "otpHash" text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "maxAttempts" integer DEFAULT 5 NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pending_registrations OWNER TO zadesk;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO zadesk;

--
-- Name: skills; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.skills (
    id text NOT NULL,
    "workspaceId" text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.skills OWNER TO zadesk;

--
-- Name: ticket_activities; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.ticket_activities (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "authorId" text,
    type text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ticket_activities OWNER TO zadesk;

--
-- Name: ticket_assignments; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.ticket_assignments (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "previousAgentId" text,
    "newAgentId" text,
    "assignedById" text,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ticket_assignments OWNER TO zadesk;

--
-- Name: ticket_shares; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.ticket_shares (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "agentId" text NOT NULL,
    "sharedById" text NOT NULL,
    "accessLevel" public."ShareAccessLevel" DEFAULT 'READ_ONLY'::public."ShareAccessLevel" NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ticket_shares OWNER TO zadesk;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.tickets (
    id text NOT NULL,
    reference text NOT NULL,
    "workspaceId" text NOT NULL,
    "assignedAgentId" text,
    "createdById" text,
    title text NOT NULL,
    description text NOT NULL,
    category text,
    priority public."TicketPriority" DEFAULT 'MEDIUM'::public."TicketPriority" NOT NULL,
    status public."TicketStatus" DEFAULT 'OPEN'::public."TicketStatus" NOT NULL,
    "customerName" text NOT NULL,
    "customerPhone" text,
    "customerEmail" text,
    "slaDueAt" timestamp(3) without time zone,
    "resolvedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "conversationId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tickets OWNER TO zadesk;

--
-- Name: users; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.users (
    id text NOT NULL,
    "googleId" text,
    email text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "avatarUrl" text,
    "passwordHash" text,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO zadesk;

--
-- Name: whatsapp_connections; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.whatsapp_connections (
    id text NOT NULL,
    "workspaceId" text NOT NULL,
    "wabaId" text NOT NULL,
    "phoneNumberId" text NOT NULL,
    "displayPhoneNumber" text NOT NULL,
    "verifiedName" text,
    "accessToken" text NOT NULL,
    status text DEFAULT 'CONNECTED'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.whatsapp_connections OWNER TO zadesk;

--
-- Name: workspace_invitations; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.workspace_invitations (
    id text NOT NULL,
    email text NOT NULL,
    "workspaceId" text NOT NULL,
    role public."Role" DEFAULT 'AGENT'::public."Role" NOT NULL,
    token text NOT NULL,
    "invitedById" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.workspace_invitations OWNER TO zadesk;

--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: zadesk
--

CREATE TABLE public.workspaces (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    address text,
    category text DEFAULT 'Autre'::text,
    city text DEFAULT 'Brazzaville'::text,
    country text DEFAULT 'Congo'::text,
    "coverUrl" text,
    description text,
    "isPublic" boolean DEFAULT true NOT NULL,
    "logoUrl" text,
    "openingHours" text,
    "supportCategories" jsonb,
    "supportEmail" text,
    "supportPhone" text,
    "supportWhatsApp" text,
    verified boolean DEFAULT true NOT NULL,
    website text,
    "normalizedName" text,
    "hasExistingSav" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.workspaces OWNER TO zadesk;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: agent_profiles; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.agent_profiles (id, "workspaceId", "userId", availability, "maxCapacity", "autoAssignmentEnabled", title, phone, "notificationEmail", "notificationApp", "createdAt", "updatedAt") FROM stdin;
cmvmhezpd0004p322h4lnkc67	cmvmhezoj0000p322p90klp0k	cmvmh8b520000p322jsjne2r5	AVAILABLE	15	t	Agent SAV	\N	t	t	2026-10-24 14:16:11.329	2026-10-24 14:16:11.329
cmvs6xt7j0009p322x2c8a42p	cmvs6xt6k0005p322gk4vonwf	cmvs6x68i0002p322k596z1v4	AVAILABLE	15	t	Agent SAV	\N	t	t	2026-10-28 14:09:30.655	2026-10-28 14:09:30.655
cmvwl9i4q000mtg22s1prqigx	cmvwl9i41000itg22im7u1zv3	cmvwl04400000my6skl2ofje8	AVAILABLE	15	t	Agent SAV	\N	t	t	2026-10-31 16:01:35.498	2026-10-31 16:01:35.498
cmvwnria4000ktg22cjmgykb9	cmvwnri9l000gtg22szqi908t	cmvwnmub30000tg67n72e9ejm	AVAILABLE	15	t	Agent SAV	\N	t	t	2026-10-31 17:11:34.731	2026-10-31 17:11:34.731
\.


--
-- Data for Name: agent_skills; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.agent_skills (id, "agentProfileId", "skillId", "validatedById", "validatedAt", "createdAt") FROM stdin;
cmvv5q92z000dp323imcccvug	cmvs6xt7j0009p322x2c8a42p	cmvv5q8yq0003p323w8zskwwv	cmvs6x68i0002p322k596z1v4	2026-10-30 15:58:56.889	2026-10-30 15:58:56.891
cmvv5q93l000fp3235mdbdz2k	cmvs6xt7j0009p322x2c8a42p	cmvv5q9080005p323h9fnnmqu	cmvs6x68i0002p322k596z1v4	2026-10-30 15:58:56.909	2026-10-30 15:58:56.912
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.audit_logs (id, "workspaceId", "userId", action, "entityType", "entityId", details, "ipAddress", "createdAt") FROM stdin;
\.


--
-- Data for Name: conversation_messages; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.conversation_messages (id, "conversationId", "senderId", "senderType", "senderName", content, "isInternalNote", "createdAt") FROM stdin;
cmvv5q99f000up323m82y5q41	cmvv5q98j000tp3232rrp3m4x	\N	CUSTOMER	Koffi Jean-Luc	Bonjour, j'ai déposé mon matériel en agence hier et je souhaite savoir si le diagnostic a débuté.	f	2026-10-30 15:58:57.116
cmvv5q99g000vp323yssl7fn1	cmvv5q98j000tp3232rrp3m4x	cmvs6x68i0002p322k596z1v4	INTERNAL_NOTE	Note interne (Confidentiel)	Matériel inspecté par l'atelier technique ce matin : nappe d'affichage endommagée, pièce de rechange disponible en stock.	t	2026-10-30 15:58:57.116
cmvv5q99g000wp323eu9f7omg	cmvv5q98j000tp3232rrp3m4x	cmvs6x68i0002p322k596z1v4	AGENT_REPLY	Agent Zadesk	Bonjour M. Koffi ! Le diagnostic a été réalisé par notre équipe technique. Votre appareil sera prêt pour retrait dès cet après-midi 15h.	f	2026-10-30 15:58:57.116
\.


--
-- Data for Name: conversation_shares; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.conversation_shares (id, "conversationId", "agentId", "sharedById", "accessLevel", "createdAt") FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.conversations (id, "workspaceId", "assignedAgentId", "customerName", "customerPhone", "customerEmail", channel, status, priority, "lastMessageAt", "createdAt", "updatedAt") FROM stdin;
cmvm0q2ek000tp36iv9bikfxc	cmtpmy6uc000bo022krf2weq4	\N	Koffi Jean-Luc	+242 06 480 92 10	\N	PORTAL	ACTIVE	HIGH	2026-10-24 06:28:54.572	2026-10-24 06:28:54.572	2026-10-24 14:09:27.078
cmvv5q98j000tp3232rrp3m4x	cmvs6xt6k0005p322gk4vonwf	cmvs6x68i0002p322k596z1v4	Koffi Jean-Luc	+242 06 480 92 10	\N	PORTAL	ACTIVE	HIGH	2026-10-30 15:58:57.09	2026-10-30 15:58:57.09	2026-10-30 15:58:57.09
\.


--
-- Data for Name: memberships; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.memberships (id, "userId", "workspaceId", role, "createdAt") FROM stdin;
cmvmhezp20002p322bckw36ka	cmvmh8b520000p322jsjne2r5	cmvmhezoj0000p322p90klp0k	OWNER	2026-10-24 14:16:11.317
cmvs6xt730007p322r0y92f2z	cmvs6x68i0002p322k596z1v4	cmvs6xt6k0005p322gk4vonwf	OWNER	2026-10-28 14:09:30.64
cmvwl9i49000ktg22shdwuglz	cmvwl04400000my6skl2ofje8	cmvwl9i41000itg22im7u1zv3	OWNER	2026-10-31 16:01:35.481
cmvwnri9v000itg226u5tv7gl	cmvwnmub30000tg67n72e9ejm	cmvwnri9l000gtg22szqi908t	OWNER	2026-10-31 17:11:34.723
\.


--
-- Data for Name: onboarding_drafts; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.onboarding_drafts (id, "userId", step, data, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: otp_tokens; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.otp_tokens (id, "userId", "otpHash", purpose, attempts, "maxAttempts", "expiresAt", "verifiedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pending_registrations; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.pending_registrations (id, email, "firstName", "lastName", "passwordHash", "otpHash", attempts, "maxAttempts", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.sessions (id, "sessionToken", "userId", "expiresAt", "createdAt", "updatedAt") FROM stdin;
cmvwl044d0002my6sx6zj1mfa	7d333373bbd871dc824e00061f1c07fdcdfbbd9a6692b6e9809ea307bff29f49	cmvwl04400000my6skl2ofje8	2026-11-07 15:54:17.436	2026-10-31 15:54:17.437	2026-10-31 15:54:17.437
cmvwlem0i000rtg2275kb6nuh	1e8f75b10d8b80c674aafd93004a2f1a6e7ffb62742e5a38a3c08f69371039de	cmvwlelya000ptg22zaxi7zq5	2026-11-07 16:05:33.809	2026-10-31 16:05:33.81	2026-10-31 16:05:33.81
cmvwnmubl0002tg672eh1n990	02fa6f2c28cc370fd1f6a82f824a3c2a3580395b2dcd3254c526864b2ddb4fc5	cmvwnmub30000tg67n72e9ejm	2026-11-07 17:07:57.056	2026-10-31 17:07:57.057	2026-10-31 17:07:57.057
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.skills (id, "workspaceId", name, description, "createdAt", "updatedAt") FROM stdin;
cmvm0q29i0003p36iloeyd97z	cmtpmy6uc000bo022krf2weq4	Support Mobile Money & Paiement	Déblocage, vérification de transactions MoMo / Airtel Money	2026-10-24 06:28:54.39	2026-10-24 06:28:54.39
cmvm0q29x0005p36i7dcf0by5	cmtpmy6uc000bo022krf2weq4	Assistance Matérielle & SAV	Diagnostic pannes, échange standard sous garantie	2026-10-24 06:28:54.405	2026-10-24 06:28:54.405
cmvm0q2aa0007p36islezx2dg	cmtpmy6uc000bo022krf2weq4	Facturation & Litiges	Régularisation comptes, avoirs et remboursements	2026-10-24 06:28:54.418	2026-10-24 06:28:54.418
cmvm0q2aw0009p36iskws4ogh	cmtpmy6uc000bo022krf2weq4	Support Réseau & Fibre	Configuration routeurs, suivi coupures et débit	2026-10-24 06:28:54.44	2026-10-24 06:28:54.44
cmvv5q8yq0003p323w8zskwwv	cmvs6xt6k0005p322gk4vonwf	Support Mobile Money & Paiement	Déblocage, vérification de transactions MoMo / Airtel Money	2026-10-30 15:58:56.737	2026-10-30 15:58:56.737
cmvv5q9080005p323h9fnnmqu	cmvs6xt6k0005p322gk4vonwf	Assistance Matérielle & SAV	Diagnostic pannes, échange standard sous garantie	2026-10-30 15:58:56.792	2026-10-30 15:58:56.792
cmvv5q90l0007p323xl6cmb1j	cmvs6xt6k0005p322gk4vonwf	Facturation & Litiges	Régularisation comptes, avoirs et remboursements	2026-10-30 15:58:56.805	2026-10-30 15:58:56.805
cmvv5q91g0009p323my6ojtno	cmvs6xt6k0005p322gk4vonwf	Support Réseau & Fibre	Configuration routeurs, suivi coupures et débit	2026-10-30 15:58:56.836	2026-10-30 15:58:56.836
\.


--
-- Data for Name: ticket_activities; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.ticket_activities (id, "ticketId", "authorId", type, content, "createdAt") FROM stdin;
cmvv5q953000ip323s6r06op0	cmvv5q94q000hp323mhll9l8g	cmvs6x68i0002p322k596z1v4	ASSIGNMENT	Ticket assigné à l'agent après qualification de l'urgence.	2026-10-30 15:58:56.967
cmvv5q953000jp323ayjeesr4	cmvv5q94q000hp323mhll9l8g	cmvs6x68i0002p322k596z1v4	NOTE	Contact pris avec l'opérateur Airtel : réconciliation bancaire en cours sous réf #REC-9912.	2026-10-30 15:58:56.967
cmvv5q96d000np32309jlwv22	cmvv5q95i000lp3239wqyl6cr	cmvs6x68i0002p322k596z1v4	ASSIGNMENT	Attribution automatique selon disponibilité de l'agent.	2026-10-30 15:58:57.013
cmvv5q97e000rp323msuek2mb	cmvv5q96u000pp3237y9rknf3	cmvs6x68i0002p322k596z1v4	RESOLUTION	Facture certifiée au format PDF transmise par email. Dossier résolu avec succès.	2026-10-30 15:58:57.05
\.


--
-- Data for Name: ticket_assignments; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.ticket_assignments (id, "ticketId", "previousAgentId", "newAgentId", "assignedById", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: ticket_shares; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.ticket_shares (id, "ticketId", "agentId", "sharedById", "accessLevel", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.tickets (id, reference, "workspaceId", "assignedAgentId", "createdById", title, description, category, priority, status, "customerName", "customerPhone", "customerEmail", "slaDueAt", "resolvedAt", "closedAt", "conversationId", metadata, "createdAt", "updatedAt") FROM stdin;
cmvm0q2cp000hp36iad5kfgj0	TK-2026-0001	cmtpmy6uc000bo022krf2weq4	\N	\N	Litige débit Mobile Money sans confirmation de validation	Le client signale un débit de 25 000 FCFA via Airtel Money (TxID: 882910) pour un abonnement non activé. Relevé de transaction fourni.	Support Mobile Money & Paiement	URGENT	IN_PROGRESS	Mavoungou Jean-Luc	+242 06 612 34 56	jeanluc.mavoungou@gmail.com	2026-10-24 10:28:54.505	\N	\N	\N	\N	2026-10-24 06:28:54.505	2026-10-24 14:09:27.078
cmvm0q2dc000lp36ihj3tsuw6	TK-2026-0002	cmtpmy6uc000bo022krf2weq4	\N	\N	Écran terminal de paiement noir après redémarrage	Matériel modèle Z-50 sous garantie déposé à l'agence de Brazzaville pour test et remplacement standard.	Assistance Matérielle & SAV	HIGH	OPEN	Pharmacie de la Paix	+242 05 520 88 12	contact@pharmaciedelapaix.cg	2026-10-25 06:28:54.526	\N	\N	\N	\N	2026-10-24 06:28:54.528	2026-10-24 14:09:27.078
cmvm0q2dz000pp36iac5p0i04	TK-2026-0003	cmtpmy6uc000bo022krf2weq4	\N	\N	Demande duplicata facture trimestrielle B2B	Duplicata de facture n° F2026-08 réclamé par la comptabilité pour clôture.	Facturation & Litiges	LOW	RESOLVED	Société Congolaise de BTP	+242 06 999 11 22	compta@scbtp.cg	\N	2026-10-22 06:28:54.549	\N	\N	\N	2026-10-24 06:28:54.551	2026-10-24 14:09:27.078
cmvv5q94q000hp323mhll9l8g	TK-2026-0001	cmvs6xt6k0005p322gk4vonwf	cmvs6x68i0002p322k596z1v4	cmvs6x68i0002p322k596z1v4	Litige débit Mobile Money sans confirmation de validation	Le client signale un débit de 25 000 FCFA via Airtel Money (TxID: 882910) pour un abonnement non activé. Relevé de transaction fourni.	Support Mobile Money & Paiement	URGENT	IN_PROGRESS	Mavoungou Jean-Luc	+242 06 612 34 56	jeanluc.mavoungou@gmail.com	2026-10-30 19:58:56.953	\N	\N	\N	\N	2026-10-30 15:58:56.954	2026-10-30 15:58:56.954
cmvv5q95i000lp3239wqyl6cr	TK-2026-0002	cmvs6xt6k0005p322gk4vonwf	cmvs6x68i0002p322k596z1v4	cmvs6x68i0002p322k596z1v4	Écran terminal de paiement noir après redémarrage	Matériel modèle Z-50 sous garantie déposé à l'agence de Brazzaville pour test et remplacement standard.	Assistance Matérielle & SAV	HIGH	OPEN	Pharmacie de la Paix	+242 05 520 88 12	contact@pharmaciedelapaix.cg	2026-10-31 15:58:56.981	\N	\N	\N	\N	2026-10-30 15:58:56.982	2026-10-30 15:58:56.982
cmvv5q96u000pp3237y9rknf3	TK-2026-0003	cmvs6xt6k0005p322gk4vonwf	cmvs6x68i0002p322k596z1v4	cmvs6x68i0002p322k596z1v4	Demande duplicata facture trimestrielle B2B	Duplicata de facture n° F2026-08 réclamé par la comptabilité pour clôture.	Facturation & Litiges	LOW	RESOLVED	Société Congolaise de BTP	+242 06 999 11 22	compta@scbtp.cg	\N	2026-10-28 15:58:57.029	\N	\N	\N	2026-10-30 15:58:57.03	2026-10-30 15:58:57.03
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.users (id, "googleId", email, "firstName", "lastName", "avatarUrl", "passwordHash", "emailVerified", "createdAt", "updatedAt") FROM stdin;
cmvmh8b520000p322jsjne2r5	102939550363769972616	japhetikoume@gmail.com	Japhet	Ikoume	https://lh3.googleusercontent.com/a/ACg8ocKok_5dyitSRalTWC74qS_ra_LDgqIWv2DXE3PTH49XCajeoxI=s96-c	\N	t	2026-10-24 14:10:59.558	2026-10-24 14:10:59.558
cmvs6x68i0002p322k596z1v4	110970556132455708988	ikoumej@gmail.com	Japhet	Ikoume	https://lh3.googleusercontent.com/a/ACg8ocK4_6kDKppQiQJDRo8YS9SVLtcKSCgazJ6Y5-YGPsmTR4i-PQ=s96-c	\N	t	2026-10-28 14:09:00.882	2026-10-28 14:09:00.882
cmvwl04400000my6skl2ofje8	\N	director-@test-congo.cg	Jean	Directeur	\N	hash	t	2026-10-31 15:54:17.424	2026-10-31 15:54:17.424
cmvwlelya000ptg22zaxi7zq5	109237781018592240595	plav.minsante.cg@gmail.com	japhet	ikoule	https://lh3.googleusercontent.com/a/ACg8ocI3oMvwCZpqIHsavuzZzInyQm9TkuC0JZi4YeyudWZ63XWTFg=s96-c	\N	t	2026-10-31 16:05:33.73	2026-10-31 16:05:33.73
cmvwnmub30000tg67n72e9ejm	\N	aime.mabiala@test-zadesk.cg	Aimé	Mabiala	\N	\N	t	2026-10-31 17:07:57.04	2026-10-31 17:07:57.04
\.


--
-- Data for Name: whatsapp_connections; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.whatsapp_connections (id, "workspaceId", "wabaId", "phoneNumberId", "displayPhoneNumber", "verifiedName", "accessToken", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: workspace_invitations; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.workspace_invitations (id, email, "workspaceId", role, token, "invitedById", "expiresAt", "acceptedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: workspaces; Type: TABLE DATA; Schema: public; Owner: zadesk
--

COPY public.workspaces (id, name, slug, "createdAt", "updatedAt", address, category, city, country, "coverUrl", description, "isPublic", "logoUrl", "openingHours", "supportCategories", "supportEmail", "supportPhone", "supportWhatsApp", verified, website, "normalizedName", "hasExistingSav") FROM stdin;
cmtpmy6ss0005o022wwru3e7w	Zando Market Congo (Test Fictif)	zando-market-congo	2026-09-06 09:54:58.924	2026-10-31 17:18:17.515	Rue Mbochi, Moungali	E-commerce & Distribution	Brazzaville	Congo	https://images.unsplash.com/photo-1556742049-0a67e557b605?w=1200&auto=format&fit=crop&q=80	Boutique en ligne congolaise : vente de smartphones, ordinateurs portables, accessoires high-tech et mode avec livraison le jour même.	t	https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80	Lun - Sam : 08h00 - 20h00	["Suivi de Commande en Cours", "Retour & Échange Produit sous Garantie", "Paiement Airtel Money / MoMo non Validé", "Demande de Facture Proforma", "Renseignements sur un Article"]	sav@zandomarket.cg	+242064112233	+242064112244	t	https://www.zandomarket.cg	zando market congo test fictif	f
cmtpmy6tn0008o02285yc3krd	Ecobank Congo	ecobank-congo	2026-09-06 09:54:58.955	2026-10-31 17:18:17.558	Immeuble Ecobank, Rond-point de la Poste	Banque & Finance	Brazzaville	Congo	https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80	Groupe bancaire panafricain offrant services bancaires aux particuliers, PME, grandes entreprises et solutions digitales Ecobank Mobile.	t	https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80	Lun - Ven : 08h00 - 16h00 | Sam : 09h00 - 12h30	["Carte Bancaire (Blocage / Perte)", "Application Ecobank Mobile & Omnilite", "Virements & Transferts Internationaux", "Relevés de Compte & Réclamations", "Prêts & Crédits"]	ecobankenquiries@ecobank.com	+242066606060	+242055202020	t	https://www.ecobank.com/cg	ecobank congo	f
cmtpmy6tv0009o022e9moxfsa	La Congolaise de Banque (LCB)	lcb-bank	2026-09-06 09:54:58.963	2026-10-31 17:18:17.566	Boulevard Denis Sassou Nguesso, Centre-Ville	Banque & Finance	Brazzaville	Congo	https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80	Banque commerciale historique du Congo, accompagnant les particuliers, commerçants et entreprises depuis plus de 60 ans.	t	https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80	Lun - Ven : 08h00 - 16h00	["Opposition Carte GIMAC & VISA", "Assistance E-banking LCB Net", "Suivi de Dossier Crédit", "Transferts d'argent rapides", "Service Clientèle Entreprises"]	contact@lcbbank.cg	+242057777777	+242068007788	t	https://www.lcbbank.cg	la congolaise de banque lcb	f
cmtpmy6uc000bo022krf2weq4	Express Union Congo	express-union-congo	2026-09-06 09:54:58.981	2026-10-31 17:18:17.598	Avenue des 3 Martyrs, Bacongo	Banque & Finance	Brazzaville	Congo	https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80	Établissement de microfinance et de transfert d'argent national et sous-régional rapide et sécurisé.	t	https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=150&auto=format&fit=crop&q=80	Lun - Sam : 07h30 - 18h00	["Suivi de Transfert Bloqué / Non Reçu", "Compte Express Union Mobile", "Erreur d'Identité ou Code Secret", "Remboursement Transaction", "Localisation d'Agence"]	contact@expressunion.cg	+242053333333	+242066778899	t	https://www.expressunioncongo.cg	express union congo	f
cmtpmy6rk0002o022s8yxols9	Airtel Congo	airtel-congo	2026-09-06 09:54:58.88	2026-10-31 17:18:17.482	Boulevard Denis Sassou Nguesso, Mpila	Télécommunications	Brazzaville	Congo	https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80	Opérateur de téléphonie mobile, fournisseur d'accès internet haut débit 4G et services financiers Airtel Money en République du Congo.	t	https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80	Lun - Sam : 07h30 - 19h00 | Dim : 08h00 - 14h00	["Airtel Money & Transactions", "Forfaits Internet & 4G", "Perte / Remplacement SIM", "Facturation & Recharge", "Assistance Technique Réseau"]	serviceclient@cg.airtel.com	+242055000000	+242055000111	t	https://www.airtel.cg	airtel congo	f
cmtpmy6sg0004o0220s49wgst	Congo Telecom (Fictif Test)	congo-telecom-test	2026-09-06 09:54:58.912	2026-10-31 17:18:17.504	Avenue Paul Doumer	Télécommunications	Brazzaville	Congo	https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80	Opérateur historique national, fourniture de fibre optique aux ménages et lignes fixes professionnelles.	t	https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80	Lun - Ven : 08h00 - 16h30	["Installation Fibre à Domicile", "Coupure Internet / Signal Faible", "Facturation Mensuelle", "Assistance Équipement Modem"]	support@congotel.cg	+242068001122	+242068001133	t	https://www.congotel.cg	congo telecom fictif test	f
cmtpmy6te0007o0227evhpjbg	Kongo Fashion Boutique (Test Fictif)	kongo-fashion-boutique	2026-09-06 09:54:58.946	2026-10-31 17:18:17.543	Rond-point Koulounda, Ouenzé	E-commerce & Distribution	Brazzaville	Congo	https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80	Maison de prêt-à-porter moderne, maroquinerie, chaussures et accessoires pour hommes et femmes.	t	https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=150&auto=format&fit=crop&q=80	Lun - Sam : 09h00 - 19h30	["Échange de Taille / Article", "Disponibilité en Magasin", "Réservation d'Article", "Commandes Personnalisées"]	contact@kongofashion.cg	+242065889900	+242065889911	f	https://www.kongofashion.cg	kongo fashion boutique test fictif	f
cmvwnri9l000gtg22szqi908t	Congolaise des Eaux	congolaise-des-eaux	2026-10-31 17:11:34.712	2026-10-31 17:11:34.712	\N	Commerce & Distribution	Brazzaville	Congo	\N	\N	t	\N	Lundi - Vendredi : 08h00 - 18h00 | Samedi : 09h00 - 13h00	["Suivi de commande & expédition", "Retour, échange ou remboursement", "Disponibilité produit en stock", "Facturation & Paiement Mobile Money", "Réclamation article défectueux"]	aime.mabiala@test-zadesk.cg	\N	+242 06 999 88 77	t	\N	congolaise des eaux	t
cmtpmy6ut000do022vy4k3y55	Startimes Congo (Test Fictif)	startimes-congo-test	2026-09-06 09:54:58.998	2026-10-31 17:18:17.615	Avenue de la Paix, Poto-Poto	Médias & Divertissement	Brazzaville	Congo	https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&auto=format&fit=crop&q=80	Télévision numérique terrestre (TNT) et satellite, bouquets accessibles et application mobile StarTimes ON.	t	https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=150&auto=format&fit=crop&q=80	Lun - Sam : 08h00 - 18h00	["Recharge Bouquet par Mobile Money", "Problème Réception Décodeur", "Achat Téléviseur Intégré Startimes", "Réclamation Signal"]	sav@startimes.cg	+242067114477	+242067114488	t	https://www.startimes.cg	startimes congo test fictif	f
cmtpmy6vs000go022jbcuabnc	TotalEnergies Marketing Congo	totalenergies-congo	2026-09-06 09:54:59.032	2026-10-31 17:18:17.647	Avenue de l'Indépendance	Énergie & Services Publics	Pointe-Noire	Congo	https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=1200&auto=format&fit=crop&q=80	Réseau de stations-services, carburants, lubrifiants, gaz domestique et solutions solaires au Congo.	t	https://images.unsplash.com/photo-1527018607619-a508a2be00be?w=150&auto=format&fit=crop&q=80	Stations 24h/24 | SAV Bureau : 08h00 - 17h00	["Carte Pétrolière & Recharge", "Disponibilité Bouteilles de Gaz", "Réclamations Station-Service", "Partenariats & Commandes Industrielles", "Solutions Lampes Solaires"]	sav.clients@totalenergies.cg	+242058888888	+242069008899	t	https://services.totalenergies.cg	totalenergies marketing congo	f
cmtpmy6w1000ho022490y2v2y	Pharmacie Centrale du Fleuve (Test Fictif)	pharmacie-centrale-du-fleuve	2026-09-06 09:54:59.041	2026-10-31 17:18:17.657	Avenue de l'OUA, Centre-Ville	Santé & Pharmacie	Brazzaville	Congo	https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&auto=format&fit=crop&q=80	Pharmacie de garde, délivrance d'ordonnances médicales, produits de parapharmacie, puériculture et oxygène médical.	t	https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=150&auto=format&fit=crop&q=80	24h/24 - 7j/7 (Pharmacie de garde permanente)	["Vérification Disponibilité Médicament", "Envoi d'Ordonnance par WhatsApp", "Demande de Prix & Devis Médical", "Livraison Urgente à Domicile"]	contact@pharmacie-fleuve.cg	+242067889900	+242067889911	t	https://www.pharmacie-fleuve.cg	pharmacie centrale du fleuve test fictif	f
cmtpmy6wg000jo022w289x3us	Congo Express Logistique (Test Fictif)	congo-express-logistique	2026-09-06 09:54:59.056	2026-10-31 17:18:17.672	Zone Industrielle Mpila	Transport & Logistique	Brazzaville	Congo	https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&auto=format&fit=crop&q=80	Services de messagerie express, fret aérien et maritime, transport interurbain Brazzaville - Pointe-Noire - Dolisie.	t	https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80	Lun - Sam : 07h30 - 18h30	["Suivi Numéro de Colis (Tracking)", "Colis Retardé ou Endommagé", "Tarifs Fret France / Chine ➔ Congo", "Enlèvement de Marchandises à Domicile"]	service.clients@congoexpress-log.cg	+242068990011	+242068990022	t	https://www.congoexpress-log.cg	congo express logistique test fictif	f
cmtpmy6wx000lo022zfovwca6	Grand Hôtel du Pool (Test Fictif)	grand-hotel-du-pool	2026-09-06 09:54:59.073	2026-10-31 17:18:17.693	Avenue Amilcar Cabral, Face Fleuve	Hôtellerie & Tourisme	Brazzaville	Congo	https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80	Hôtel 4 étoiles en bordure du fleuve Congo : chambres de standing, suites panoramiques, salles de conférence et restaurant gastronomique.	t	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80	Réception & Conciergerie 24h/24	["Réservation de Chambre & Tarifs", "Organisation Séminaire / Mariage", "Navette Aéroport Maya-Maya", "Room Service & Restaurant"]	concierge@grandhotelpool.cg	+242057112233	+242057112244	t	https://www.grandhotelpool.cg	grand hotel du pool test fictif	f
cmtpmy6x3000mo022xxe58g38	Restaurant Traiteur La Congolaise (Test Fictif)	restaurant-la-congolaise	2026-09-06 09:54:59.079	2026-10-31 17:18:17.699	Boulevard de la Liberté, Poto-Poto	Restauration & Gastronomie	Brazzaville	Congo	https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80	Saveurs locales authentiques (Saka-saka, Poisson braisé, Maboké) et cuisine internationale, service traiteur pour événements et réceptions.	t	https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80	Mar - Dim : 11h30 - 23h00	["Réservation de Table", "Commande à Emporter / Livraison", "Devis Traiteur & Événements", "Menu Spécial du Jour"]	commandes@lacongolaise-resto.cg	+242064998877	+242064998888	f	https://www.lacongolaise-resto.cg	restaurant traiteur la congolaise test fictif	f
cmtpmy6xj000oo022s3agn28p	ImmoPool Brazza (Test Fictif)	immopool-brazza	2026-09-06 09:54:59.095	2026-10-31 17:18:17.717	Quartier Bacongo, Rue Lénine	BTP & Immobilier	Brazzaville	Congo	https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80	Agence immobilière spécialisée dans la location, vente de villas, appartements meublés, terrains titrés et gestion locative sécurisée.	t	https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=150&auto=format&fit=crop&q=80	Lun - Ven : 08h30 - 17h00 | Sam : 09h00 - 13h00	["Recherche Location Villa / Appartement", "Visite Guidée de Bien Immobilier", "Achat Terrain Titré", "Gestion Locative pour Propriétaire"]	contact@immopool.cg	+242066442211	+242066442222	t	https://www.immopool.cg	immopool brazza test fictif	f
cmtpmy6vm000fo022p4fmywqo	La Congolaise des Eaux - LCDE (Test Fictif)	lcde-congo-test	2026-09-06 09:54:59.026	2026-10-31 17:18:17.634	Quartier Mpila	Énergie & Services Publics	Brazzaville	Congo	https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80	Société nationale de traitement et de distribution d'eau potable dans les agglomérations urbaines du Congo.	t	https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=150&auto=format&fit=crop&q=80	Lun - Ven : 07h30 - 15h30 | Urgences fuites 24h/24	["Signalement Fuite sur Voie Publique", "Coupure d'Eau Prolongée", "Demande de Branchement Particulier", "Paiement Facture d'Eau"]	reclamation@lcde.cg	+242051112233	+242051112244	t	https://www.lcde.cg	la congolaise des eaux lcde test fictif	f
cmtpmy6ul000co0223frulnsw	Canal+ Congo	canal-plus-congo	2026-09-06 09:54:58.99	2026-10-31 17:18:17.607	Avenue Nelson Mandela	Médias & Divertissement	Brazzaville	Congo	https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80	Distributeur officiel des bouquets de chaînes télévisées et offres numériques par satellite et fibre au Congo.	t	https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&auto=format&fit=crop&q=80	Lun - Sam : 08h00 - 18h30	["Réabonnement & Décodeur", "Code d'erreur (E16, E30...)", "Changement de Formule", "Installation Parabole & SAV Matériel", "Application CANAL+"]	contact.congo@canal-plus.com	+242055555050	+242069002233	t	https://www.canalplus-afrique.com/cg	canal congo	f
cmtpmy6xc000no022k2ifrg6q	BatiCongo Matériaux (Test Fictif)	baticongo-materiaux	2026-09-06 09:54:59.088	2026-10-31 17:18:17.711	Route Nationale 1, PK 12	BTP & Immobilier	Dolisie	Congo	https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80	Quincaillerie industrielle et fournisseur de matériaux de construction : ciment, fer à béton, carrelage, plomberie et outillage avec livraison sur chantier.	t	https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80	Lun - Sam : 07h00 - 17h30	["Demande de Devis Chiffré", "Disponibilité Ciment & Ferraille", "Planification Livraison Camion", "Compte Client Professionnel"]	devis@baticongo.cg	+242055112288	+242055112299	t	https://www.baticongo.cg	baticongo materiaux test fictif	f
cmtpmy6v1000eo022jv53iv58	Énergie Électrique du Congo (E2C)	e2c-congo	2026-09-06 09:54:59.006	2026-10-31 17:18:17.625	Avenue Paul Doumer, Plaine	Énergie & Services Publics	Brazzaville	Congo	https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80	Société nationale en charge de la distribution d'électricité, de la gestion des compteurs prépayés et du réseau public en République du Congo.	t	https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=150&auto=format&fit=crop&q=80	24h/24 (Urgences & Pannes) | Agences : 07h30 - 15h30	["Signalement de Panne de Secteur", "Recharge & Code Compteur Prépayé", "Demande de Nouveau Raccordement", "Facturation & Réclamation Index", "Câble Dangereux / Intervention Rapide"]	sav@e2c.cg	+242050000022	+242065002244	t	https://www.e2c.cg	energie electrique du congo e2c	f
cmtpmy6s20003o0223nvd2gfa	MTN Congo	mtn-congo	2026-09-06 09:54:58.898	2026-10-31 17:18:17.495	Avenue Amilcar Cabral, Centre-Ville	Télécommunications	Brazzaville	Congo	https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&auto=format&fit=crop&q=80	Leader des télécommunications mobiles et de l'innovation digitale (MoMo, 4G LTE, Fibre) au Congo.	t	https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80	Lun - Ven : 08h00 - 17h30 | Sam : 08h30 - 13h00	["MoMo (Mobile Money) & Déblocage", "Pass Internet & Offres Yamo", "Problème Réseau & Connexion", "Identification & KYC Légal", "Offres Entreprises & Fibre"]	customercare.cg@mtn.com	+242066000000	+242066000123	t	https://www.mtn.cg	mtn congo	f
cmtpmy6t50006o022vwgfp1w3	ElectroCongo Tech (Test Fictif)	electrocongo-tech	2026-09-06 09:54:58.937	2026-10-31 17:18:17.53	Avenue Charles de Gaulle	E-commerce & Distribution	Pointe-Noire	Congo	https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200&auto=format&fit=crop&q=80	Magasin spécialisé en électroménager, téléviseurs Smart TV, climatiseurs et réfrigérateurs avec service d'installation et SAV agréé.	t	https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=150&auto=format&fit=crop&q=80	Lun - Sam : 08h30 - 18h30	["Dépannage Appareil sous Garantie", "Demande d'Installation Climatiseur", "Pièces Détachées & Accessoires", "Livraison à Domicile"]	service.client@electrocongo.cg	+242056334455	+242056334466	t	https://www.electrocongo.cg	electrocongo tech test fictif	f
cmtpmy6w8000io02295znvz58	Clinique Océan Santé (Test Fictif)	clinique-ocean-sante	2026-09-06 09:54:59.048	2026-10-31 17:18:17.663	Quartier Tié-Tié, Rue de la Paix	Santé & Pharmacie	Pointe-Noire	Congo	https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&auto=format&fit=crop&q=80	Centre médical pluridisciplinaire : médecine générale, pédiatrie, maternité, radiologie et laboratoire d'analyses médicales.	t	https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80	Urgences 24h/24 | Consultations : 07h00 - 19h00	["Prise de Rendez-vous Médical", "Résultats d'Analyses & Laboratoire", "Urgences Médicales & Ambulance", "Renseignements Prise en Charge Assurance"]	accueil@clinique-ocean.cg	+242054223344	+242054223355	t	https://www.clinique-ocean.cg	clinique ocean sante test fictif	f
cmtpmy6wo000ko022yw4xxs3d	Navette Fluviale Pool Express (Test Fictif)	pool-express-navette	2026-09-06 09:54:59.065	2026-10-31 17:18:17.682	Port Autonome de Brazzaville (Beach)	Transport & Logistique	Brazzaville	Congo	https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&auto=format&fit=crop&q=80	Traversées rapides par canots rapides et vedettes confortables sur le fleuve Congo entre Brazzaville et Kinshasa.	t	https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=150&auto=format&fit=crop&q=80	Tous les jours : 06h30 - 18h00	["Horaires des Traversées du Jour", "Réservation Billet VIP", "Franchise Bagages & Marchandises", "Informations Formalités Douanières"]	reservation@poolexpress.cg	+242065113355	+242065113366	t	https://www.poolexpress.cg	navette fluviale pool express test fictif	f
cmtpmy6u5000ao022fbetra1x	BGFI Bank Congo (Test Fictif)	bgfibank-congo-test	2026-09-06 09:54:58.973	2026-10-31 17:18:17.584	Boulevard du 15 Août 1960	Banque & Finance	Brazzaville	Congo	https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80	Premier groupe financier d'Afrique Centrale, banque des grandes entreprises et de la clientèle privée.	t	https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=150&auto=format&fit=crop&q=80	Lun - Ven : 08h00 - 16h00	["Assistance BGFI Mobile & E-Banking", "Opposition Carte Gold / Platinum", "Service Affaires & PME", "Comptes Épargne & Placements"]	contact@bgfibank.cg	+242069112233	+242069112244	t	https://www.bgfibank.cg	bgfi bank congo test fictif	f
cmvmhezoj0000p322p90klp0k	totale mvoue	totale-mvoue	2026-10-24 14:16:11.298	2026-10-24 14:16:11.298	\N	Commerce & Distribution	Brazzaville	Congo	\N	\N	t	\N	Lun - Ven : 08h00 - 18h00	["Assistance Générale", "Suivi de dossier", "Réclamation"]	\N	\N	\N	t	\N	totale mvoue	f
cmvs6xt6k0005p322gk4vonwf	totale mvoue	totale-mvoue-1	2026-10-28 14:09:30.62	2026-10-28 14:09:30.62	\N	Commerce & Distribution	Brazzaville	Congo	\N	\N	t	\N	Lun - Ven : 08h00 - 18h00	["Assistance Générale", "Suivi de dossier", "Réclamation"]	\N	\N	\N	t	\N	totale mvoue#legacy-gk4vonwf	f
cmvwl9i41000itg22im7u1zv3	Brazza Tech Solutions	brazza-tech-solutions	2026-10-31 16:01:35.474	2026-10-31 16:01:35.474	\N	Commerce & Distribution	Brazzaville	Congo	\N	\N	t	\N	Lundi - Vendredi : 08h00 - 18h00 | Samedi : 09h00 - 13h00	["Suivi de commande & expédition", "Retour, échange ou remboursement", "Disponibilité produit en stock", "Facturation & Paiement Mobile Money", "Réclamation article défectueux"]	director-@test-congo.cg	\N	+242 06 999 88 77	t	\N	brazza tech solutions	t
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: agent_profiles agent_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT agent_profiles_pkey PRIMARY KEY (id);


--
-- Name: agent_skills agent_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.agent_skills
    ADD CONSTRAINT agent_skills_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: conversation_messages conversation_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_pkey PRIMARY KEY (id);


--
-- Name: conversation_shares conversation_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversation_shares
    ADD CONSTRAINT conversation_shares_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: onboarding_drafts onboarding_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.onboarding_drafts
    ADD CONSTRAINT onboarding_drafts_pkey PRIMARY KEY (id);


--
-- Name: onboarding_drafts onboarding_drafts_userId_key; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.onboarding_drafts
    ADD CONSTRAINT "onboarding_drafts_userId_key" UNIQUE ("userId");


--
-- Name: otp_tokens otp_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.otp_tokens
    ADD CONSTRAINT otp_tokens_pkey PRIMARY KEY (id);


--
-- Name: pending_registrations pending_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.pending_registrations
    ADD CONSTRAINT pending_registrations_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: ticket_activities ticket_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_activities
    ADD CONSTRAINT ticket_activities_pkey PRIMARY KEY (id);


--
-- Name: ticket_assignments ticket_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT ticket_assignments_pkey PRIMARY KEY (id);


--
-- Name: ticket_shares ticket_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_shares
    ADD CONSTRAINT ticket_shares_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_connections whatsapp_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.whatsapp_connections
    ADD CONSTRAINT whatsapp_connections_pkey PRIMARY KEY (id);


--
-- Name: workspace_invitations workspace_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT workspace_invitations_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: agent_profiles_userId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "agent_profiles_userId_idx" ON public.agent_profiles USING btree ("userId");


--
-- Name: agent_profiles_workspaceId_availability_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "agent_profiles_workspaceId_availability_idx" ON public.agent_profiles USING btree ("workspaceId", availability);


--
-- Name: agent_profiles_workspaceId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "agent_profiles_workspaceId_idx" ON public.agent_profiles USING btree ("workspaceId");


--
-- Name: agent_profiles_workspaceId_userId_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "agent_profiles_workspaceId_userId_key" ON public.agent_profiles USING btree ("workspaceId", "userId");


--
-- Name: agent_skills_agentProfileId_skillId_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "agent_skills_agentProfileId_skillId_key" ON public.agent_skills USING btree ("agentProfileId", "skillId");


--
-- Name: agent_skills_skillId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "agent_skills_skillId_idx" ON public.agent_skills USING btree ("skillId");


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_workspaceId_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "audit_logs_workspaceId_entityType_entityId_idx" ON public.audit_logs USING btree ("workspaceId", "entityType", "entityId");


--
-- Name: audit_logs_workspaceId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "audit_logs_workspaceId_idx" ON public.audit_logs USING btree ("workspaceId");


--
-- Name: conversation_messages_conversationId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "conversation_messages_conversationId_idx" ON public.conversation_messages USING btree ("conversationId");


--
-- Name: conversation_messages_conversationId_isInternalNote_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "conversation_messages_conversationId_isInternalNote_idx" ON public.conversation_messages USING btree ("conversationId", "isInternalNote");


--
-- Name: conversation_shares_agentId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "conversation_shares_agentId_idx" ON public.conversation_shares USING btree ("agentId");


--
-- Name: conversation_shares_conversationId_agentId_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "conversation_shares_conversationId_agentId_key" ON public.conversation_shares USING btree ("conversationId", "agentId");


--
-- Name: conversations_workspaceId_assignedAgentId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "conversations_workspaceId_assignedAgentId_idx" ON public.conversations USING btree ("workspaceId", "assignedAgentId");


--
-- Name: conversations_workspaceId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "conversations_workspaceId_idx" ON public.conversations USING btree ("workspaceId");


--
-- Name: conversations_workspaceId_status_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "conversations_workspaceId_status_idx" ON public.conversations USING btree ("workspaceId", status);


--
-- Name: memberships_userId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "memberships_userId_idx" ON public.memberships USING btree ("userId");


--
-- Name: memberships_userId_workspaceId_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "memberships_userId_workspaceId_key" ON public.memberships USING btree ("userId", "workspaceId");


--
-- Name: memberships_workspaceId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "memberships_workspaceId_idx" ON public.memberships USING btree ("workspaceId");


--
-- Name: onboarding_drafts_userId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "onboarding_drafts_userId_idx" ON public.onboarding_drafts USING btree ("userId");


--
-- Name: otp_tokens_userId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "otp_tokens_userId_idx" ON public.otp_tokens USING btree ("userId");


--
-- Name: otp_tokens_userId_purpose_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "otp_tokens_userId_purpose_idx" ON public.otp_tokens USING btree ("userId", purpose);


--
-- Name: pending_registrations_email_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX pending_registrations_email_idx ON public.pending_registrations USING btree (email);


--
-- Name: pending_registrations_email_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX pending_registrations_email_key ON public.pending_registrations USING btree (email);


--
-- Name: pending_registrations_expiresAt_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "pending_registrations_expiresAt_idx" ON public.pending_registrations USING btree ("expiresAt");


--
-- Name: sessions_sessionToken_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "sessions_sessionToken_idx" ON public.sessions USING btree ("sessionToken");


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: skills_workspaceId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "skills_workspaceId_idx" ON public.skills USING btree ("workspaceId");


--
-- Name: skills_workspaceId_name_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "skills_workspaceId_name_key" ON public.skills USING btree ("workspaceId", name);


--
-- Name: ticket_activities_ticketId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "ticket_activities_ticketId_idx" ON public.ticket_activities USING btree ("ticketId");


--
-- Name: ticket_assignments_ticketId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "ticket_assignments_ticketId_idx" ON public.ticket_assignments USING btree ("ticketId");


--
-- Name: ticket_shares_agentId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "ticket_shares_agentId_idx" ON public.ticket_shares USING btree ("agentId");


--
-- Name: ticket_shares_ticketId_agentId_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "ticket_shares_ticketId_agentId_key" ON public.ticket_shares USING btree ("ticketId", "agentId");


--
-- Name: ticket_shares_ticketId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "ticket_shares_ticketId_idx" ON public.ticket_shares USING btree ("ticketId");


--
-- Name: tickets_workspaceId_assignedAgentId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "tickets_workspaceId_assignedAgentId_idx" ON public.tickets USING btree ("workspaceId", "assignedAgentId");


--
-- Name: tickets_workspaceId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "tickets_workspaceId_idx" ON public.tickets USING btree ("workspaceId");


--
-- Name: tickets_workspaceId_priority_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "tickets_workspaceId_priority_idx" ON public.tickets USING btree ("workspaceId", priority);


--
-- Name: tickets_workspaceId_reference_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "tickets_workspaceId_reference_key" ON public.tickets USING btree ("workspaceId", reference);


--
-- Name: tickets_workspaceId_status_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "tickets_workspaceId_status_idx" ON public.tickets USING btree ("workspaceId", status);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_googleId_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "users_googleId_key" ON public.users USING btree ("googleId");


--
-- Name: whatsapp_connections_phoneNumberId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "whatsapp_connections_phoneNumberId_idx" ON public.whatsapp_connections USING btree ("phoneNumberId");


--
-- Name: whatsapp_connections_workspaceId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "whatsapp_connections_workspaceId_idx" ON public.whatsapp_connections USING btree ("workspaceId");


--
-- Name: whatsapp_connections_workspaceId_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "whatsapp_connections_workspaceId_key" ON public.whatsapp_connections USING btree ("workspaceId");


--
-- Name: workspace_invitations_email_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX workspace_invitations_email_idx ON public.workspace_invitations USING btree (email);


--
-- Name: workspace_invitations_token_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX workspace_invitations_token_idx ON public.workspace_invitations USING btree (token);


--
-- Name: workspace_invitations_token_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX workspace_invitations_token_key ON public.workspace_invitations USING btree (token);


--
-- Name: workspace_invitations_workspaceId_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "workspace_invitations_workspaceId_idx" ON public.workspace_invitations USING btree ("workspaceId");


--
-- Name: workspaces_normalizedName_country_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX "workspaces_normalizedName_country_key" ON public.workspaces USING btree ("normalizedName", country);


--
-- Name: workspaces_normalizedName_idx; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE INDEX "workspaces_normalizedName_idx" ON public.workspaces USING btree ("normalizedName");


--
-- Name: workspaces_slug_key; Type: INDEX; Schema: public; Owner: zadesk
--

CREATE UNIQUE INDEX workspaces_slug_key ON public.workspaces USING btree (slug);


--
-- Name: agent_profiles agent_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT "agent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: agent_profiles agent_profiles_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT "agent_profiles_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: agent_skills agent_skills_agentProfileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.agent_skills
    ADD CONSTRAINT "agent_skills_agentProfileId_fkey" FOREIGN KEY ("agentProfileId") REFERENCES public.agent_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: agent_skills agent_skills_skillId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.agent_skills
    ADD CONSTRAINT "agent_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES public.skills(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversation_messages conversation_messages_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversation_messages conversation_messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT "conversation_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conversation_shares conversation_shares_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversation_shares
    ADD CONSTRAINT "conversation_shares_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversation_shares conversation_shares_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversation_shares
    ADD CONSTRAINT "conversation_shares_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversation_shares conversation_shares_sharedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversation_shares
    ADD CONSTRAINT "conversation_shares_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_assignedAgentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conversations conversations_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberships memberships_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memberships memberships_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT "memberships_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: onboarding_drafts onboarding_drafts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.onboarding_drafts
    ADD CONSTRAINT "onboarding_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: otp_tokens otp_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.otp_tokens
    ADD CONSTRAINT "otp_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skills skills_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT "skills_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ticket_activities ticket_activities_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_activities
    ADD CONSTRAINT "ticket_activities_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ticket_activities ticket_activities_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_activities
    ADD CONSTRAINT "ticket_activities_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ticket_assignments ticket_assignments_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT "ticket_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ticket_assignments ticket_assignments_newAgentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT "ticket_assignments_newAgentId_fkey" FOREIGN KEY ("newAgentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ticket_assignments ticket_assignments_previousAgentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT "ticket_assignments_previousAgentId_fkey" FOREIGN KEY ("previousAgentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ticket_assignments ticket_assignments_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_assignments
    ADD CONSTRAINT "ticket_assignments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ticket_shares ticket_shares_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_shares
    ADD CONSTRAINT "ticket_shares_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ticket_shares ticket_shares_sharedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_shares
    ADD CONSTRAINT "ticket_shares_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ticket_shares ticket_shares_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.ticket_shares
    ADD CONSTRAINT "ticket_shares_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets tickets_assignedAgentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tickets tickets_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tickets tickets_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tickets tickets_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: whatsapp_connections whatsapp_connections_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.whatsapp_connections
    ADD CONSTRAINT "whatsapp_connections_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_invitations workspace_invitations_invitedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT "workspace_invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workspace_invitations workspace_invitations_workspaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: zadesk
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT "workspace_invitations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES public.workspaces(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PV80e7UshudDnSTwkzIZIFiXr4vidUUNS5Ui357TQLftYiGEFEFWBdQSOze4Ljv

