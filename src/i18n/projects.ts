import type { Lang } from "./ui";

export interface Project {
  tag: string;
  title: string;
  description: string;
}

interface ProjectEntry {
  sv: Project;
  en: Project;
}

const projectEntries: ProjectEntry[] = [
  {
    sv: { tag: "AI-agent", title: "Community Assistant", description: "AI-chattbotagenter exponerade som HTTP-endpoints. E-postinsamling, AI-taggning, event sourcing. 3-stegs LLM-teststrategi med 80% täckning." },
    en: { tag: "AI Agent", title: "Community Assistant", description: "AI chatbot agents exposed as HTTP endpoints. Email ingestion, AI tagging, event sourcing. 3-tier LLM testing strategy with 80% coverage." },
  },
  {
    sv: { tag: "Infrastruktur", title: "Pi-PAI", description: "MCP-kontrollplan som deployar autonoma Claude Code-servrar. Sessionslivscykel, bearer token-auth, resursbegränsningar, auto-restore vid boot." },
    en: { tag: "Infrastructure", title: "Pi-PAI", description: "MCP control plane deploying autonomous Claude Code servers. Session lifecycle, bearer token auth, resource caps, auto-restore on boot." },
  },
  {
    sv: { tag: "Legacyräddning", title: "Agentisk DLL-dekompilering", description: "Dekompilera-redigera-kompilera-pipeline för proprietära .NET DLL:er. Named mutex-fixar, 19 Playwright-regressionstester, deployad till 5 kundsajter." },
    en: { tag: "Legacy Rescue", title: "Agentic DLL Decompilation", description: "Decompile-edit-recompile pipeline for proprietary .NET DLLs. Named mutex fixes, 19 Playwright regression tests, deployed to 5 customer sites." },
  },
  {
    sv: { tag: "Fullstack-PoC", title: "Chess Tournament Modernizer", description: "Legacy Java Swing-app återfödd som Spring Boot + React 19. 10 API-controllers, 260+ E2E-tester, Docker multi-stage build, Ansible-deploy." },
    en: { tag: "Full-Stack PoC", title: "Chess Tournament Modernizer", description: "Legacy Java Swing app reborn as Spring Boot + React 19. 10 API controllers, 260+ E2E tests, Docker multi-stage build, Ansible deployment." },
  },
  {
    sv: { tag: "Tankeledarskap", title: "AI Trust Infrastructure", description: "Publicerad artikel om att leverera AI-agenter i produktion. 22 iterativa utkast, 15+ ADR:er. Tillit som infrastruktur, inte kapabilitet." },
    en: { tag: "Thought Leadership", title: "AI Trust Infrastructure", description: "Published article on shipping AI agents in production. 22 iterative drafts, 15+ ADRs. Trust as infrastructure, not capability." },
  },
  {
    sv: { tag: "Meta", title: "Detta CV", description: "Byggt av en AI-agent. HTML:en, scroll-animationerna, innehållet. Du tittar på det just nu." },
    en: { tag: "Meta", title: "This CV", description: "Built by an AI agent. The HTML, the scroll animations, the content. You're looking at it right now." },
  },
  {
    sv: { tag: "DevOps", title: "GitOps Pipeline Engine", description: "Deklarativ deploy-pipeline med auto-rollback. Helm chart-templating, ArgoCD sync waves, Slack-larm vid drift-avvikelse." },
    en: { tag: "DevOps", title: "GitOps Pipeline Engine", description: "Declarative deployment pipeline with auto-rollback. Helm chart templating, ArgoCD sync waves, Slack alerting on drift detection." },
  },
  {
    sv: { tag: "Dataplattform", title: "Event Stream Backbone", description: "Kafka-baserat event mesh som bearbetar 2M händelser/dag. Schema registry, dead-letter-köer, exakt-en-gång-leverans med idempotenta konsumenter." },
    en: { tag: "Data Platform", title: "Event Stream Backbone", description: "Kafka-based event mesh processing 2M events/day. Schema registry, dead-letter queues, exactly-once delivery with idempotent consumers." },
  },
  {
    sv: { tag: "Säkerhet", title: "Zero-Trust Auth Gateway", description: "mTLS service mesh-gateway med OIDC-integration. Token-rotation, rate limiting, audit-loggning. Under 5ms overhead per request." },
    en: { tag: "Security", title: "Zero-Trust Auth Gateway", description: "mTLS service mesh gateway with OIDC integration. Token rotation, rate limiting, audit logging. Sub-5ms overhead per request." },
  },
  {
    sv: { tag: "Mobil", title: "Field Inspection App", description: "Offline-first React Native-app för industriinspektioner. SQLite sync-motor, kamera-OCR-pipeline, PDF-rapportgenerering på enheten." },
    en: { tag: "Mobile", title: "Field Inspection App", description: "Offline-first React Native app for industrial inspections. SQLite sync engine, camera OCR pipeline, PDF report generation on-device." },
  },
  {
    sv: { tag: "ML Ops", title: "Model Serving Platform", description: "Kubernetes-nativ modellregistrering med canary-deploys. A/B-trafikdelning, latensmedveten autoskalning, GPU bin-packing-schemaläggare." },
    en: { tag: "ML Ops", title: "Model Serving Platform", description: "Kubernetes-native model registry with canary deployments. A/B traffic splitting, latency-aware autoscaling, GPU bin-packing scheduler." },
  },
  {
    sv: { tag: "Open Source", title: "AST Refactor CLI", description: "TypeScript-codemods via AST-manipulation. 40+ transformregler, dry-run-läge, git-medveten diffning. 1.2k GitHub-stjärnor." },
    en: { tag: "Open Source", title: "AST Refactor CLI", description: "TypeScript codemods via AST manipulation. 40+ transform rules, dry-run mode, git-aware diffing. 1.2k GitHub stars." },
  },
];

export function getProjects(lang: Lang): Project[] {
  return projectEntries.map((entry) => entry[lang]);
}

export { projectEntries };
