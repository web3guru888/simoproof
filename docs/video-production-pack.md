# SimoProof — Video Production Pack
*Written by simoproof-writer · 2026-05-03 · ETHGlobal Open Agents 2026*
*Revised to timestamped format per SIMOPROOF coordinator brief*

---

## OVERVIEW

**Video title:** SimoProof — ETHGlobal Open Agents 2026
**Target length:** 2:57 (under 3:00 hard limit)
**Speakers:** Shaka Lei Kaumaka (SHAKA) + Robin Dey (ROBIN)
**Tagline:** "Every claim proven. Every vote on-chain."
**Live demo:** https://simoproof.org
**GitHub:** https://github.com/web3guru888/simoproof

### Narrative arc
```
[0:00–0:45]  PROBLEM      — The reproducibility crisis is real and getting worse
[0:45–1:18]  SOLUTION     — SimoProof's 7-step verifiable pipeline
[1:18–2:27]  LIVE DEMO    — Run it for real on simoproof.org
[2:27–2:49]  INTEGRATIONS — ENS · Gensyn AXL · KeeperHub
[2:49–2:57]  CLOSE        — Call to action
```

### Sponsor integrations to mention (required)
| Sponsor | Where it appears |
|---------|-----------------|
| **ENS** | Architecture + Demo (node-1.simoproof.eth) + Prize section |
| **Gensyn AXL** | Architecture + Demo (Step 1) + Prize section |
| **KeeperHub** | Architecture + Demo (Step 7) + Prize section |
| **RISC Zero** | Architecture + Demo (Step 3, key moment) |
| **EAS** | Architecture + Demo (attestation feed) |
| **ASI:One** | Architecture (Simocracy senate) |

### Voice guide
- **SHAKA** — enthusiastic, visionary. She owns the problem framing, the intro, the ZK dramatic moment, and the close. Short punchy sentences.
- **ROBIN** — technical, precise. He owns the architecture walkthrough and drives the entire live demo. Deliberate pace on demo so viewers can read the UI.

---

## FULL SCRIPT

> **Format note:** Each line is timestamped `[MM:SS–MM:SS]`. Approximate word count shown as `(~N wds)` — this is your pacing guide. Natural speech runs ~120–130 wpm; do not rush. Lines are your words — adjust any phrasing that doesn't feel like you.
>
> **Speaker assignments:** SHAKA owns Sections 1, 2 and 5 (narrative, problem, solution, close). ROBIN owns Sections 3 and 4 (live demo, integrations).

---

### SECTION 1 — THE PROBLEM `[00:00–00:45]`
**Speaker: SHAKA**

```
[00:00–00:20] SHAKA:
Seventy percent of researchers can't reproduce each other's experiments. And now AI is
generating discoveries a thousand times faster than humans can verify. The trust problem
just got exponentially worse. Twenty-eight billion dollars a year wasted. Regulators
can't audit it. Investors won't fund it. The public calls it hallucinations and moves on.
(~52 wds)

[00:20–00:45] SHAKA:
The root cause? No deterministic execution. No consensus mechanism. No cryptographic
proof that a claim was valid when it was made. That's the gap SimoProof closes.
(~30 wds)
```

---

### SECTION 2 — THE SOLUTION `[00:45–01:18]`
**Speaker: SHAKA**

```
[00:45–00:52] SHAKA:
SimoProof. ZK-provable, ENS-native, decentralized. Every empirical claim proven
on-chain, step by step.
(~13 wds)

[00:52–01:18] SHAKA:
A discovery comes in through Gensyn AXL — three P2P nodes pre-validate it. Our
Simocracy senate, four AI agents on ASI:One, vote independently. Two of four to pass.
The source hash, confidence score, and senate transcript are committed inside a RISC
Zero ZK proof. Stored on 0G. Attested via EAS on Base Sepolia. ENS identity updated
live. KeeperHub automates every step.
(~60 wds — keep energetic, visionary pace; architecture diagram on screen carries the detail)
```

---

### SECTION 3 — LIVE DEMO `[01:18–02:27]`
**Speaker: ROBIN**

> **Robin drives the browser the entire demo. Move the cursor deliberately. Speak at 90% of your normal pace — let the UI breathe between sentences.**

```
[01:18–01:26] ROBIN:
This is simoproof.org. Live, on Cloudflare Pages. Ten verified discoveries already
on-chain. Let's run one now.
(~17 wds)

[01:26–01:36] ROBIN:
Arctic sea ice — September 2023, 4.23 million square kilometres, 97% confidence,
sourced from NSIDC. Clicking Run Pipeline.
(~17 wds — pause 1 second before clicking)

[01:36–01:46] ROBIN:
Step one: Gensyn AXL ingestion — three P2P nodes pre-validating. Step two: Simocracy
senate deliberating — four agents, independent votes.
(~18 wds)

[01:46–02:02] ROBIN:
Step three — RISC Zero zkVM generating the proof right now. It's verifying the SHA-256
source hash against the raw API data, gating on 97% confidence, checking the senate vote
count. The full deliberation transcript is sealed inside the proof journal.
Cryptographically anchored.
(~40 wds — slow down here, this is the headline technical moment)

[02:02–02:12] ROBIN:
Steps four through seven: 0G storage, EAS attestation on Base Sepolia, ENS update,
KeeperHub. Watch the terminal — DiscoveryVerifier.sol just submitted. Non-revocable.
(~25 wds)

[02:12–02:20] ROBIN:
Live attestation feed — that row links directly to EAS Scan on Base Sepolia. You can
verify this independently right now.
(~20 wds)

[02:20–02:27] ROBIN:
node-1.simoproof.eth — discoveries_count at ten, latest EAS UID live in the ENS text
records. On-chain audit log.
(~18 wds)
```

---

### SECTION 4 — PRIZE INTEGRATIONS `[02:27–02:49]`
**Speaker: ROBIN**

```
[02:27–02:36] ROBIN:
For ENS: every verifier node is a full ENSIP-25 agent — agent type, capabilities,
protocol version, AXL pubkey, all in live text records. Permissionless peer discovery.
(~27 wds)

[02:36–02:44] ROBIN:
Gensyn AXL is the P2P pre-validation backbone. Three nodes, encrypted peer-to-peer,
broadcasting the claim before it ever hits the senate.
(~23 wds)

[02:44–02:49] ROBIN:
KeeperHub: five automated workflows, every pipeline stage, guaranteed retry, zero manual
intervention.
(~14 wds)
```

---

### SECTION 5 — CLOSE `[02:49–02:57]`
**Speaker: SHAKA**

```
[02:49–02:57] SHAKA:
SimoProof. Every claim proven. Every vote on-chain. Live demo at simoproof.org — go run it.
(~16 wds)
```

---

**TOTAL WORD COUNT: ~364 words | ESTIMATED SPEAKING TIME: ~2:42–2:54**
*(Accounts for natural pauses, demo click timing, and deliberate pacing on technical sections.)*

---

## STORYBOARD

> What's on screen at each timestamp. These are your visual edit decisions.
> `→` means a cut or transition to the next visual.

```
[00:00–00:18] SCREEN: Slide 2 — "Introducing SIMOPROOF" title card fades in.
              Orange graffiti SIMOPROOF logo, robot hands reaching toward each other,
              purple/teal background, "ETH GLOBAL OPEN AGENTS 2026" subtitle.
              Hold static for full 18 seconds — this is your brand anchor shot.

[00:18–00:34] SCREEN: → Cut to Slide 4 — "The Scientific Reproducibility Crisis."
              Four stats visible: 70%, $28B, 1000x, "No standardized framework."
              Hold static. Let stats land visually while Robin speaks.

[00:34–00:45] SCREEN: → Cut to Slide 5 — "Who Suffers?" + "Root Causes."
              Root causes list (missing standards, no deterministic execution, no
              consensus, no cryptographic proofs, centralized validation) visible.
              Hold static. Advance from slide 4 exactly as Shaka starts "No deterministic..."

[00:45–00:52] SCREEN: → Cut to Slide 3 — three-column feature grid.
              "SimoProof is a ZK-provable, ENS-native, decentralized protocol..."
              Hold 7 seconds max — this is just the visual handoff before architecture.

[00:52–01:18] SCREEN: → Cut to Slide 6 — Architecture pipeline diagram. HOLD FOR 26 SECONDS.
              Full pipeline: ATLAS CLAIM → AXL → Simocracy Senate → RISC Zero →
              0G Storage → EAS → ENS → KeeperHub.
              This is the visual payoff slide. Pan or zoom slowly down the pipeline
              if using video; otherwise just hold static. The diagram does the work.

[01:18–01:26] SCREEN: → Cut to simoproof.org in browser (Chrome, full screen, no bookmarks bar).
              Hero visible: "Every claim proven. Every vote on-chain."
              Scroll slowly to reveal stats strip: "10 Verified Discoveries · 4 Senate
              Agents · 7 Pipeline Steps."

[01:26–01:36] SCREEN: → Scroll to #demo section. Demo panel visible.
              LEFT COLUMN: Click "🧊 Arctic Ice" tab. Claim text appears. Confidence 0.97.
              Source: NSIDC. Causal chain summary.
              RIGHT COLUMN: All 7 pipeline steps show "idle."
              Cursor visible. Click "▶ Run Pipeline" button.

[01:36–01:46] SCREEN: → Pipeline right column animates:
              Step 1 "AXL Ingestion" → 🔄 running (hold ~3s)
              → Step 2 "Science Senate" → 🔄 running (terminal below starts populating:
              "SIMOCRACY SCIENCE SENATE — ASI:ONE 4-SIM")
              Keep right column in frame. Bayesian Reasoner logs starting to show.

[01:46–02:02] SCREEN: → Step 3 "RISC Zero ZK Proof" → 🔄 running.
              HOLD HERE for the full 16 seconds. This is your headline technical moment.
              Show the progress bar / running indicator. Terminal below shows:
              "risc0 — zk proof · RISC Zero guest verifies confidence ≥ 0.85 and senate
              votes ≥ 2, seals commitment in journal."
              Zoom in slightly if needed so the step label is clearly legible.

[02:02–02:12] SCREEN: → Steps 4–7 tick through quickly:
              0G Storage ✓ → EAS Attestation ✓ → ENS Update ✓ → KeeperHub ✓
              Scroll down to show terminal window. Key log lines:
              "chain — eas attestation"
              "DiscoveryVerifier.sol submits the ABI-encoded journal to EAS on Base Sepolia."
              "[keeperhub] ✓ simoproof-poll-discoveries: 22f6255b51ecf1fa9814"
              Banner: "✓ Complete — 3/4 votes — EAS confirmed"

[02:12–02:20] SCREEN: → Scroll down to "LIVE ATTESTATIONS" section.
              5 green VERIFIED rows visible. Partial hashes shown.
              Click the top row (disc-001, Arctic ice, 0xddeb...). New tab opens showing
              EAS Scan attestation on base-sepolia.easscan.org.
              Hold on attestation page for 4 seconds.

[02:20–02:27] SCREEN: → Switch tab to app.ens.domains.
              Pre-loaded: node-1.simoproof.eth text records page.
              Key records visible: discoveries_count=10, latest_eas_uid=0xddeb0e...,
              agent_type=verified-discovery-node, capabilities=climate,health,ecology.
              Zoom in so text records are legible.

[02:27–02:35] SCREEN: → Return to simoproof.org. Scroll to LIVE DEPLOYMENTS section.
              ENS Identity row: "node-1.simoproof.eth" visible. Or hold on Slide 3 (feature grid).
              Both work. ENS records still readable if zoomed.

[02:35–02:43] SCREEN: → Deployments section showing "Gensyn AXL — axl-node v0.2.1" row.
              Or hold on Slide 6 — AXL PRE-VALIDATION box highlighted.

[02:43–02:49] SCREEN: → KeeperHub workflows section on the site, OR terminal showing
              KeeperHub workflow IDs: simoproof-poll-discoveries, simoproof-validate, etc.

[02:49–02:57] SCREEN: → Hard cut back to Slide 2 — "SIMOPROOF" title card.
              Or: simoproof.org hero with "simoproof.org" URL visible in browser address bar.
              HOLD until audio ends. End frame should have the URL clearly readable.
              Fade to black (optional, 0.5s). Done.
```

---

## SHOT LIST

> Record all shots listed below before editing. Capture in this order — slides first (fastest), then site statics, then the live demo run.

### A. SLIDES (capture as PNGs or static screen recordings)

| # | Shot | How to capture | Hold time |
|---|------|---------------|-----------|
| S01 | **Slide 2** — "Introducing SIMOPROOF" title card | Open `slides/slide-2.png` fullscreen in browser, or Canva fullscreen | 20s |
| S02 | **Slide 4** — "The Scientific Reproducibility Crisis" stats | Open `slide-4.png` fullscreen | 20s |
| S03 | **Slide 5** — "Who Suffers? / Root Causes" | Open `slide-5.png` fullscreen | 15s |
| S04 | **Slide 3** — Three-column feature overview | Open `slide-3.png` fullscreen | 10s |
| S05 | **Slide 6** — Architecture pipeline diagram | Open `slide-6.png` fullscreen | 35s — this slide gets 26s screen time |
| S06 | **Slide 1** — Gradient background (optional) | Only needed if used as title background overlay | 5s |

> **Tip:** Export from Canva as PNG (if you have access). Otherwise screenshot the PDF in fullscreen browser. 1920×1080 minimum.

---

### B. SIMOPROOF.ORG — STATIC STATES (before running demo)

| # | Shot | What to show | URL |
|---|------|-------------|-----|
| S07 | **Hero + tagline** | "Every claim proven. Every vote on-chain." fully visible, CTA buttons visible | https://simoproof.org |
| S08 | **Stats strip** | Scroll down: "10 Verified Discoveries · 4 Senate Agents · 7 Pipeline Steps" in view | Scroll ~900px from top |
| S09 | **Demo panel — idle** | Arctic Ice tab selected (click it). All 7 pipeline steps showing "idle." "▶ Run Pipeline" button visible. DO NOT click yet. | https://simoproof.org#demo |

---

### C. SIMOPROOF.ORG — LIVE PIPELINE RUN

> **CRITICAL:** Record this entire sequence as ONE CONTINUOUS screen recording. Do not stop between steps.
> Do a full dry run first to learn the timing. Then record for real.

| # | Shot / Event | Notes | Approx timing |
|---|-------------|-------|--------------|
| S10 | **Click "▶ Run Pipeline"** | Move cursor deliberately to button. Pause 1 second, then click. Cursor should be visible. | t=0 |
| S11 | **Step 1 — AXL Ingestion** → 🔄 running | Stay on pipeline panel. Don't scroll. | t=0–5s |
| S12 | **Step 2 — Science Senate** → 🔄 running | Terminal below starts showing senate logs. Let it run. | t=5–10s |
| S13 | **Step 3 — RISC Zero ZK Proof** → 🔄 running ⭐ KEY SHOT | Linger here. Zoom in on step label if using crop tool. Progress bar visible. | t=10–18s |
| S14 | **Steps 4–7 completing** | 0G Storage ✓ → EAS Attestation ✓ → ENS Update ✓ → KeeperHub ✓. Let each flip naturally. | t=18–25s |
| S15 | **Pipeline complete banner** | "✓ Complete — 3/4 votes — EAS confirmed" fully visible. All 7 steps green. | t=25–28s |
| S16 | **Terminal output — slow scroll** | Scroll terminal to show: `chain — eas attestation` and `[keeperhub] ✓ simoproof-poll-discoveries: 22f6255b...`. Read rate: 1 line per second. | t=28–38s |

---

### D. SIMOPROOF.ORG — POST-PIPELINE SECTIONS

| # | Shot | Notes |
|---|------|-------|
| S17 | **"LIVE ATTESTATIONS" section** | Scroll down to show all 5 VERIFIED rows with green checkmarks and partial hashes. |
| S18 | **Click disc-001 attestation row** | Click Arctic ice row (0xddeb...). New tab opens. Wait for EAS Scan to load. |
| S19 | **LIVE DEPLOYMENTS section** | Scroll to show: DiscoveryVerifier.sol address, EAS Schema, ENS Identity (node-1.simoproof.eth), Gensyn AXL row, KeeperHub (5 workflows). |

---

### E. EXTERNAL SITES

| # | Shot | URL | Notes |
|---|------|-----|-------|
| S20 | **EAS Scan attestation** | https://base-sepolia.easscan.org (disc-001 attestation) | Show: claim_hash, zk_proof, ens_name fields. Hold 5s. |
| S21 | **ENS text records** | https://app.ens.domains — search `node-1.simoproof.eth` | Show: discoveries_count=10, latest_eas_uid, agent_type. Pre-load tab before recording. Zoom in on records table. |

---

### F. GITHUB

| # | Shot | Notes |
|---|------|-------|
| S22 | **GitHub repo page** | https://github.com/web3guru888/simoproof — scroll slowly from README top. Show badges: `tests 8/8 passing`, `ZK Risc0 v3.0`, `ENS node-1.simoproof.eth`. Tags: ens, axl, ethglobal, zk-proofs, risc0, gensyn, keeperhub. |

---

## RECORDING GUIDE

### Equipment setup

**Screen recording**
- **Recommended:** [OBS Studio](https://obsproject.com/) — free, all platforms, best quality
- **Alternative:** Loom (free tier, records screen + mic together — easier but harder to sync separately)
- **Mac fallback:** QuickTime → File → New Screen Recording
- **Settings:** 1920×1080, 30fps, MP4/MOV output
- **Browser prep:**
  - Use Chrome or Firefox
  - Hide bookmarks bar: `Ctrl/Cmd+Shift+B`
  - Close all other tabs before recording
  - Turn off system notifications (macOS: Focus mode; Windows: Do Not Disturb)
  - Zoom browser to 100% — not zoomed in or out

**Audio (voiceover)**

The best workflow is to **record audio separately** from screen recording:
1. Robin records the browser demo silently, at the right pace (following the script in his head)
2. Shaka records her lines into an audio file
3. Robin records his lines into an audio file
4. Both audio tracks get layered over the screen recording in editing

If that's too complex, recording voice live while doing the screen demo also works — just harder to fix mistakes.

**Mic recommendations:**
- AirPods or any earbuds with built-in mic: acceptable
- USB mic (Blue Yeti, Rode NT-USB, etc.): much better
- No mic at all: do NOT use — laptop mic picks up keyboard and fan noise

**Room setup:**
- Close the door
- No AC or fan humming
- Closets work great as a makeshift booth
- Record a 5-second test, listen back on headphones before your real take

**Audio recording tools:**
- Mac: GarageBand or QuickTime → New Audio Recording
- Windows: Audacity (free) or Voice Recorder
- Export as `.wav` (lossless) or `.mp3` at 192kbps+

---

### Slide recording (Shots S01–S06)

**Option A — Use the PNG files directly in editing** *(recommended)*
The slides are already exported as PNGs at `/shared/kb/simoproof/slides/`. Import them directly into your editing software (CapCut/iMovie/DaVinci). No screen recording needed for slides — just place as image clips on the timeline.

**Option B — Record them as screen video**
1. Open the slides PDF from GitHub: `https://raw.githubusercontent.com/web3guru888/simoproof/main/docs/simoproof%20slides.pdf`
2. Or open in Canva if Shaka has the source
3. Set to fullscreen (`F11`)
4. Record each slide holding for 20+ seconds (you'll trim in editing)

---

### Demo run recording (Shots S07–S21)

**Before you start recording:**
1. Open tab 1: https://simoproof.org (scroll to #demo, select Arctic Ice, DO NOT click Run yet)
2. Open tab 2: https://app.ens.domains → type `node-1.simoproof.eth` in search, press Enter, wait for text records to load, DO NOT close
3. Open tab 3: The EAS Scan attestation for disc-001 — find it in the attestations feed on the site
4. Clear any unrelated tabs
5. Start screen recording
6. **Do one full dry run** — run the pipeline once to see the step timings. Note which step takes longest.

**During recording — cursor discipline:**
- Move your cursor slowly and deliberately
- When clicking a button, move to it, pause 1 second, then click
- When not clicking, park the cursor somewhere neutral (corner of screen)
- Never hover over unrelated UI elements

**Demo pacing guide:**
| Step | When to speak |
|------|--------------|
| Click "Run Pipeline" | Pause 1s after saying "Clicking Run Pipeline" — THEN click |
| AXL Ingestion running | Start speaking immediately as it lights up |
| Science Senate running | Let it run 2s before speaking about senate |
| RISC Zero running | **Wait for step to fully light up**, then speak Shaka's ZK lines |
| Steps 4–7 | Let them run — say the one-liner as they're completing, not before |
| Terminal logs | Scroll slowly so viewers can read — 1 line per second |

**If the pipeline fails or stalls:**
- Testnets are flaky — this happens
- Reload the page and try again
- Have a backup pre-recorded run to use as fallback if needed

**Tab switching:**
- Switch tabs slowly: click the tab → wait 2 full seconds for the page to settle → then speak

---

### Editing

**Recommended tools:**

| Tool | Platform | Cost | Best for |
|------|----------|------|---------|
| **CapCut** | Mac/Win/iOS | Free | Easiest. One-click auto-captions. Great for quick assembly. |
| **iMovie** | Mac/iOS | Free | Clean timeline. Good for this length. |
| **DaVinci Resolve** | Mac/Win/Linux | Free | Most powerful. Worth it if either of you knows it. |

**Edit sequence:**

1. **Import** all screen recording clips, slide PNGs/clips, and audio files
2. **Build timeline** in storyboard order (match the `[MM:SS]` timestamps in the storyboard above)
3. **Lay down audio** — place Shaka's voice track and Robin's voice track on separate audio channels
4. **Sync video to audio** — use visible events (cursor clicking "Run Pipeline", pipeline step transitions) as sync points
5. **Place slides** as image clips at the right timestamps
6. **Add lower-third text captions** for key tech terms judges may not know:
   - `RISC Zero zkVM` when that step runs
   - `EAS Attestation — Base Sepolia` when attestation step fires
   - `ENS ENSIP-25` when ENS section appears
   - `Gensyn AXL — P2P Pre-validation` at step 1
   - `KeeperHub — 5 Automated Workflows` at step 7
7. **Optional:** subtle ambient music, 5–8% volume mix — should be barely audible, never distracting
8. **Export:** MP4, H.264, 1920×1080, 30fps

**Keeping it under 3:00:**
- If you run long: trim from prize integration section first (least demo-critical)
- Pipeline animation can be sped up to 1.2× in post if steps are slow
- Each section has a hard timestamp budget — stick to it

---

### Captions

ETHGlobal judges often watch without sound. Add captions:
- **CapCut:** one-click auto-caption generation. Review and fix these manually:
  - `RISC Zero` (often transcribed as "risk zero" or "risc 0")
  - `ENSIP-25` (often transcribed incorrectly)
  - `EAS` (often "ease" or "eas")
  - `AXL` (often "axle")
  - `0G` (often "zero g" — replace with "0G Network" in captions)
- **YouTube alternative:** Upload, enable auto-captions, download as `.srt`, review, re-upload

---

### Final export & submission

1. **Export:** MP4, H.264, 1920×1080, 30fps, ~150–300MB for a ~3-min video
2. **Upload to YouTube as Unlisted** (required by ETHGlobal — not Public, not Private)
   - Title: `SimoProof — ETHGlobal Open Agents 2026`
   - Description:
     ```
     SimoProof — ZK-provable, ENS-native, decentralized protocol for verifying empirical claims.
     
     Live demo: https://simoproof.org
     GitHub: https://github.com/web3guru888/simoproof
     EAS Schema: https://base-sepolia.easscan.org/schema/view/0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2
     ENS: node-1.simoproof.eth
     
     ETHGlobal Open Agents 2026 submission
     Built by Shaka Lei Kaumaka and Robin Dey
     ```
3. **Test the link** in a private/incognito browser window before submitting to ETHGlobal
4. **Loom** is also accepted as an alternative to YouTube if needed

---

## TIMING BREAKDOWN

| Section | Start | End | Duration | Words | wpm | Speaker(s) |
|---------|-------|-----|----------|-------|-----|-----------|
| Problem — Hook | 00:00 | 00:18 | 0:18 | 30 | 100 | SHAKA |
| Problem — Stats | 00:18 | 00:34 | 0:16 | 29 | 109 | ROBIN |
| Problem — Root causes | 00:34 | 00:45 | 0:11 | 21 | 114 | SHAKA |
| Solution — Intro | 00:45 | 00:52 | 0:07 | 13 | 111 | SHAKA |
| Solution — Architecture | 00:52 | 01:18 | 0:26 | 62 | 143 | ROBIN |
| Demo — Site load | 01:18 | 01:26 | 0:08 | 18 | 135 | ROBIN |
| Demo — Claim select | 01:26 | 01:36 | 0:10 | 17 | 102 | ROBIN |
| Demo — Steps 1–2 | 01:36 | 01:46 | 0:10 | 17 | 102 | ROBIN |
| Demo — ZK proof ⭐ | 01:46 | 02:02 | 0:16 | 38 | 142 | SHAKA |
| Demo — Steps 4–7 | 02:02 | 02:12 | 0:10 | 24 | 144 | ROBIN |
| Demo — Attestation | 02:12 | 02:20 | 0:08 | 20 | 150 | ROBIN |
| Demo — ENS | 02:20 | 02:27 | 0:07 | 22 | 188 | ROBIN |
| Prize — ENS | 02:27 | 02:35 | 0:08 | 22 | 165 | SHAKA |
| Prize — Gensyn AXL | 02:35 | 02:43 | 0:08 | 22 | 165 | ROBIN |
| Prize — KeeperHub | 02:43 | 02:49 | 0:06 | 13 | 130 | SHAKA |
| Close | 02:49 | 02:57 | 0:08 | 16 | 120 | SHAKA |
| **TOTAL** | | | **2:57** | **384** | **~130 avg** | |

> **Note on wpm:** The Architecture section (Robin, 143 wpm) and Attestation/ENS sections are slightly fast but realistic for an excited builder reciting a technical list. If any section feels rushed on playback, add 0.5–1 second of visual-only pause before the next line rather than cutting words.

---

## APPENDIX: Key Facts for Ad-Libs / Judge Q&A

If judges ask follow-up questions or you want to expand any section:

**The 5 real discoveries:**
| ID | Claim | Confidence | Senate |
|----|-------|-----------|--------|
| disc-001 | Arctic sea ice min 4.23M km² (Sep 2023) | 0.97 | 4/4 |
| disc-002 | Global temp anomaly +1.45°C above pre-industrial | 0.97 | 4/4 |
| disc-003 | PM2.5 >100µg/m³ → 23% hospital admissions rise (SE Asia) | 0.87 | 3/4 |
| disc-004 | CO₂ reached 421.08 ppm (2023) | 0.99 | 4/4 |
| disc-005 | Brazil forest area 58.9% → 55.1% (2018–2022) | 0.89 | 3/4 |

**ZK proof proves 4 things:** SHA-256 source integrity · confidence ≥ 0.85 · senate_votes ≥ 2/4 · causal summary non-empty

**Senate agents:** Bayesian Reasoner · Domain Skeptic · Causal Analyst · Replication Auditor (all via ASI:One)

**Contract:** `DiscoveryVerifier.sol` on Base Sepolia: `0x902e138Be827c6AE8504Cfd2E54caeb2910690Dc` — 8/8 Foundry tests passing

**KeeperHub workflows (5):** `simoproof-poll-discoveries` · `simoproof-validate-claim` · `simoproof-zk-prove` · `simoproof-attest` · `simoproof-ens-update`

**Prize targets:** ENS $5k + Gensyn $5k + KeeperHub $5k = **$15,000**

---

*End of Video Production Pack. Deadline: today, May 3, 2026. You built something real — go show it.*
