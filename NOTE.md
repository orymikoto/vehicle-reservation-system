# Candidate Note & Engineering Philosophy — Sekawan Media Technical Test

**Candidate**: Mikli Oktarianto  
**Position**: Project Lead  
**Company**: Sekawan Media, Malang  
**Project**: MineFleet — Enterprise Vehicle Reservation System  
**Repository**: [github.com/orymikoto/vehicle-reservation-system](https://github.com/orymikoto/vehicle-reservation-system)

---

## 🙋‍♂️ Short Introduction

Hello team at Sekawan Media Malang,

I am **Mikli Oktarianto**, applying for the **Project Lead** position at Sekawan Media. This repository contains the complete implementation of the Vehicle Reservation System technical test built according to your technical assessment requirements.

---

## 🤖 Agentic AI & Engineering Philosophy

My decision to use agentic AI tools (Antigravity & agentic workflow) to complete this project is rooted in my professional experience and a continuous learning mindset to stay aligned with tech industry evolutions.

Using agentic AI is, in my view, where software development is heading. This choice does not stem from an inability to code manually; as a **Computer Science alumnus**, I firmly believe it is our responsibility as software engineers to continuously master emerging technological paradigms. Naturally, given time and effort, I can code every line of this application manually. However, leveraging AI allows achieving high-quality production results with significantly higher time efficiency.

---

## 💡 Human Leadership, Client Needs & Problem Solving

It is important to emphasize that all architectural decision-making, domain rules, client problem-solving, and system trade-offs were authored and directed by me, Mikli Oktarianto.

> *"Throughout my experience as a software developer, the hardest part is rarely writing the code itself, but correctly interpreting human/client needs and delivering solutions that meet or exceed their expectations. As humans, we understand client nuances that an AI with minimal context cannot grasp. As a Project Lead, translating client needs into technical specifications for the engineering team—while managing the team and deciding what should be done in situations where technology has no obvious answer—is the primary responsibility."*

---

## 📐 The Methodology & Rigor of Agentic Engineering

Agentic software development is **not** simply pasting a PDF prompt into an AI tool and expecting 0 bugs. Producing a maintainable, clean-architecture project required a disciplined, multi-phase engineering process:

1. **Requirements & Domain Analysis**: Reading the client specification and breaking down domain entities (Multi-Location Mining Fleet, 2-Level Approvals, Schedule Overlaps, Inter-site Transfers).
2. **Context & Rules Architecture**: Drafting explicit repository rules (`ai-rules.md`, `architecture.md`, `ui-guidelines.md`) defining strict layer boundaries (Presentation, Application, Domain, Infrastructure), SOLID principles, Pint formatting rules, and UI color palettes.
3. **Iterative Code Reviews**: Evaluating every proposed diff, inspecting logs, ensuring DTO contracts were met, and refining database migration strategies.
4. **Automated Testing & Verification**: Writing unit and feature test suites using Pest to guarantee robust execution and zero regression.

---

## 🌐 Rationale for English Prompting

All prompts, architectural guidelines, and repository rule files were written in **English**.

> **Rationale**: AI models and LLMs exhibit significantly higher predictability, context retention, and instruction-following fidelity when prompted in English, as the vast majority of their training parameters, documentation, and open-source codebases are published in English.

---

## 📌 Reserved Feature Ideas & Architectural Trade-offs

Here are two specific architectural considerations and reserved ideas from my technical roadmap:

### 1. Vehicle Fuel Type Differentiation (Diesel vs. Gasoline)
- **Production Context**: In a live mining site operation, heavy vehicles run on Diesel (Solar/Dex) while light transport runs on Gasoline. Different fuel types carry different per-liter costs, which directly impacts asset accounting.
- **UX Trade-off Decision**: For this technical assessment, I opted for a single system fuel price configuration variable. This decision streamlined admin UX during fuel logging—preventing site admins from having to manually calculate per-liter rates for different fuel grades—and avoided free-text price inputs that risk data misinput and violate system data conventions.

### 2. Driver Experience Leveling & Risk-Based Route Recommendation
- **Production Context**: Drivers categorized into experience tiers (e.g. Junior, Senior, Master Driver) based on cumulative distance coverage and terrain hazard training. Highly experienced drivers can be automatically prioritized at the top of select dropdowns for high-risk mining terrain trips (e.g., steep pit sectors).
- **Background**: This feature is based on my direct prior experience designing worker leveling and experience matrix systems in commercial software applications.
