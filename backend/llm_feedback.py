import os
import json
import re
import random
from openai import AsyncOpenAI

# ── Groq client (free AI) ─────────────────────────────────────────────────────

def get_groq_client() -> AsyncOpenAI | None:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return None
    return AsyncOpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )

# ── Real-time feedback (Groq, FAANG-calibrated) ───────────────────────────────

def _basic_feedback(transcript: str, features: dict) -> str:
    wpm = features.get("wpm", 0)
    filler_rate = features.get("filler_rate", 0)
    filler_words_used = features.get("filler_words", [])
    structure = "Use the STAR method: open with the Situation, define your Task, detail your Actions specifically, then quantify the Result."

    if not transcript.strip():
        return json.dumps({
            "expand": "No transcript was captured — ensure your microphone is working and speak clearly.",
            "cut": "N/A",
            "must_mention": "Quantified results — top candidates always include metrics (%, $, time saved).",
            "structure": structure,
            "pace": "No audio captured. Aim for 130–150 WPM — conversational but deliberate.",
            "framing": "Use active language and own your contributions: say 'I built...' not 'we kind of put together...'",
            "overall": "Check your microphone setup and try again.",
        })

    if wpm < 100:
        pace_advice = f"You spoke at {wpm:.0f} WPM — below the ideal range of 130–150 WPM. Slow answers can signal low energy or uncertainty. Practice speeding up slightly and using deliberate pauses only after key points."
    elif wpm > 180:
        pace_advice = f"You spoke at {wpm:.0f} WPM — too fast. Interviewers struggle to absorb key points at this pace. Slow to 130–150 WPM, and pause for 1–2 seconds after delivering your result to let it land."
    else:
        pace_advice = f"Your pace of {wpm:.0f} WPM is solid (ideal: 130–150 WPM). Now focus on deliberate pauses after key statements — silence signals confidence and gives interviewers time to absorb what you said."

    cut_advice = "Avoid lengthy background context before getting to your action — interviewers want to hear what YOU did, not a preamble."
    if filler_rate > 0.08:
        filler_str = ", ".join(list(dict.fromkeys(filler_words_used))[:4]) if filler_words_used else "filler words"
        cut_advice = f"Reduce filler words like '{filler_str}' (appearing {filler_rate*100:.0f}% of the time). Replace every 'um' or 'like' with a brief, silent pause — confident pausing beats filler every time."

    return json.dumps({
        "expand": "Add specific metrics and concrete outcomes — numbers are what make an answer memorable and credible to interviewers.",
        "cut": cut_advice,
        "must_mention": "Quantified results and the direct business or team impact of your actions. Top candidates always include at least one number.",
        "structure": structure,
        "pace": pace_advice,
        "framing": "Strengthen your ownership language: replace 'I helped with...' with 'I led...'; replace 'we tried to...' with 'I drove...'; replace vague outcomes like 'it went well' with specific results. Speak in first person and claim your contributions.",
        "overall": "Add one concrete metric to your answer — quantified results are what separate strong candidates from forgettable ones.",
    })


async def transcribe_with_groq(audio_bytes: bytes, filename: str = "recording.webm") -> str:
    """Send audio to Groq Whisper — no local installation needed."""
    client = get_groq_client()
    if not client:
        return ""
    try:
        response = await client.audio.transcriptions.create(
            model="whisper-large-v3-turbo",
            file=(filename, audio_bytes, "audio/webm"),
        )
        return response.text.strip()
    except Exception as e:
        print(f"Groq transcription error: {e}")
        return ""


async def get_llm_feedback(transcript: str, features: dict, question: str = "") -> str:
    client = get_groq_client()
    if not client or not transcript.strip():
        return _basic_feedback(transcript, features)

    wpm = features.get("wpm", 0)
    filler_rate = features.get("filler_rate", 0)
    word_count = features.get("word_count", 0)
    filler_words = features.get("filler_words", [])
    filler_list = ", ".join(set(filler_words)) if filler_words else "none"
    question_ctx = f'Interview question: "{question}"\n\n' if question else ""

    prompt = f"""You are a senior interviewer and communication coach at a top-tier company (Google, Meta, Amazon, Apple, Microsoft).
Analyze this interview answer with the same rigor used to separate offer-worthy responses from rejections.

{question_ctx}Candidate's answer:
"{transcript}"

Speech metrics: {wpm:.0f} WPM | {filler_rate*100:.1f}% filler words ({filler_list}) | {word_count} words total

Benchmarks: Ideal pace is 130–150 WPM. Filler rate should be under 3%. Strong answers run 150–250 words.

Give SPECIFIC, HONEST coaching. Reference exact phrases from the answer when possible. Be direct — name what was said, what was missing, and how to fix it. Address the candidate directly using "you" and "your" throughout all feedback fields — never use "they", "them", or "their".

Return ONLY this JSON object (no markdown, no explanation):
{{
  "expand": "What specific detail, story beat, or metric did you gloss over? Name the exact moment in your answer and what you should have added.",
  "cut": "What specific part of your answer added no value or buried the lead? Quote or paraphrase it and explain exactly why it weakened your response.",
  "must_mention": "What concept, quantified result, framework, or evidence do the strongest candidates always include that your answer missed? Be specific.",
  "structure": "How well did you use STAR (Situation/Task/Action/Result)? Which element was weakest, and what one structural change would have the biggest impact on your answer?",
  "pace": "Your pace was {wpm:.0f} WPM (ideal: 130–150 WPM). What does this mean for how interviewers perceive you? Give specific advice: when to slow down, where to insert a deliberate pause, and how your pace affects perceived confidence.",
  "framing": "What specific word choices or phrasing weakened your answer? Give 1–2 concrete rewrites in the format 'instead of [that phrase], say [stronger version]'. Focus on ownership language, active voice, and impact framing.",
  "overall": "The single most critical change you need to make before your real interview. One direct, specific sentence."
}}"""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=900,
        )
        raw = (response.choices[0].message.content or "").strip()
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)
        raw = raw.strip()
        # Validate it's parseable JSON with our expected keys
        parsed = json.loads(raw)
        if all(k in parsed for k in ("expand", "cut", "must_mention", "structure", "pace", "framing", "overall")):
            return raw
    except Exception as e:
        print(f"Groq feedback error: {e}")

    return _basic_feedback(transcript, features)

# ── Question bank ─────────────────────────────────────────────────────────────

def _categorize(job_type: str) -> str:
    jt = job_type.lower()
    if any(w in jt for w in ["engineer", "developer", "programmer", "software", "frontend", "backend",
                               "fullstack", "full stack", "devops", "cloud", "sre", "platform",
                               "data scientist", "machine learning", "ml engineer", "ai engineer",
                               "data engineer", "android", "ios", "mobile"]):
        return "tech"
    if any(w in jt for w in ["nurse", "doctor", "physician", "therapist", "pharmacist", "surgeon",
                               "medical", "clinical", "healthcare", "dental", "physical therapy",
                               "occupational therapy", "paramedic", "radiolog"]):
        return "healthcare"
    if any(w in jt for w in ["product manager", "product owner", "program manager", "scrum master"]):
        return "product"
    if any(w in jt for w in ["designer", "ux", "ui ", "graphic", "creative director",
                               "art director", "visual designer", "motion"]):
        return "design"
    if any(w in jt for w in ["accountant", "financial analyst", "finance", "investment", "banking",
                               "auditor", "cfo", "controller", "actuar", "underwriter"]):
        return "finance"
    if any(w in jt for w in ["teacher", "professor", "instructor", "educator", "tutor",
                               "lecturer", "teaching", "curriculum", "principal"]):
        return "education"
    if any(w in jt for w in ["sales", "account executive", "business development", "account manager",
                               "sales manager", "sales engineer", "closing"]):
        return "sales"
    if any(w in jt for w in ["customer service", "customer success", "customer support",
                               "customer experience", "client success", "help desk"]):
        return "customer_service"
    if any(w in jt for w in ["marketing", "growth", "content", "seo", "social media", "brand",
                               "demand generation", "copywriter", "campaign"]):
        return "marketing"
    if any(w in jt for w in ["operations", "supply chain", "logistics", "warehouse",
                               "procurement", "inventory", "fulfillment"]):
        return "operations"
    if any(w in jt for w in ["hr ", "human resources", "recruiter", "talent", "people ops",
                               "talent acquisition", "hrbp", "compensation"]):
        return "hr"
    if any(w in jt for w in ["analyst", "business analyst", "data analyst", "research analyst",
                               "strategy analyst", "insights"]):
        return "analyst"
    if any(w in jt for w in ["project manager", "delivery manager", "engagement manager",
                               "project lead", "pmo"]):
        return "project_mgmt"
    if any(w in jt for w in ["consultant", "strategy", "management consulting", "advisory"]):
        return "consulting"
    return "general"


QUESTION_BANK: dict[str, dict[str, list[str]]] = {

    "tech": {
        "behavioral": [
            "Walk me through the most complex system you've designed or built. What were the key architectural decisions?",
            "Tell me about a time you had to make a significant technical decision with incomplete information. What was your process?",
            "Describe a time you pushed back on a product or business requirement because of technical constraints. How did that conversation go?",
            "Tell me about a production incident you were involved in. What was the root cause and what did you change afterward?",
            "Describe a time you had to learn a completely new technology or language to deliver a project under a deadline.",
            "Tell me about a piece of code or system you're proud of and why.",
            "Describe a time you disagreed with another engineer's technical approach. How did you handle it?",
            "Tell me about a time you identified and addressed significant technical debt. How did you prioritize and justify the work?",
        ],
        "situational": [
            "A critical service goes down in production at 2am. Walk me through your response process.",
            "You're one week before a release and discover a major bug in a component you didn't write. What do you do?",
            "You're asked to estimate a feature that has significant ambiguity. How do you handle that?",
            "Your team is split on two different architectural approaches. You have to make a call. How do you decide?",
            "A stakeholder asks you to skip testing to ship faster. How do you respond?",
        ],
        "technical": [
            "How do you approach code reviews — both when reviewing others' code and when your own is being reviewed?",
            "How do you handle technical debt in a fast-moving codebase where there's constant pressure to ship?",
            "Walk me through your debugging process when you encounter a bug you've never seen before.",
            "How do you estimate task complexity, and what do you do when your estimates are consistently off?",
            "How do you stay current with new technologies, and how do you decide which ones are worth investing time in?",
            "What does good software documentation look like to you, and how do you balance writing it with delivery speed?",
        ],
        "entry-level": [
            "Tell me about a personal project, class project, or internship that challenged you technically. What did you build and what did you learn?",
            "What programming concepts or tools have been hardest to learn, and how did you work through them?",
            "How do you approach a bug you've been stuck on for a long time without making progress?",
            "What does clean, maintainable code mean to you?",
        ],
        "mid-level": [
            "Describe a project where you owned the technical design end-to-end. What trade-offs did you make?",
            "How have you helped junior engineers on your team grow?",
            "Tell me about a time you improved a development process or workflow that was slowing your team down.",
            "How do you communicate technical complexity to non-engineers?",
        ],
        "senior": [
            "Tell me about a time you influenced the technical direction of your team or organization without having formal authority.",
            "How do you approach building systems that need to scale 10x in the next two years?",
            "Describe how you've mentored engineers and what approaches have worked best.",
            "How do you balance long-term technical health with short-term delivery pressure?",
        ],
        "leadership": [
            "How do you build a high-performing engineering team from the ground up?",
            "Tell me about a time you had to advocate for technical investment to non-technical leadership.",
            "How do you manage the tension between shipping velocity and engineering quality?",
            "Describe how you've handled an underperforming engineer on your team.",
        ],
    },

    "healthcare": {
        "behavioral": [
            "Describe a situation where you had to deliver difficult news to a patient or their family.",
            "Tell me about a time you caught an error — yours or a colleague's — that could have harmed a patient.",
            "Describe a conflict you had with a physician or colleague over a care decision and how it was resolved.",
            "Tell me about a time you advocated for a patient when they weren't being heard.",
            "Describe your most challenging patient case and what you learned from it.",
            "Tell me about a time you had to handle a patient who was non-compliant or refused treatment.",
            "Describe a situation where you had to remain calm and effective in an extremely high-stress emergency.",
        ],
        "situational": [
            "You're managing four patients simultaneously and one suddenly deteriorates. Walk me through your priorities.",
            "A patient's family member is furious about the care plan and demands to speak with you immediately. How do you handle it?",
            "You notice a colleague repeatedly cutting corners on documentation or protocol. What do you do?",
            "A patient discloses something sensitive that you believe requires a report. How do you approach the conversation with them?",
        ],
        "technical": [
            "How do you stay current with clinical guidelines and evidence-based practice in your specialty?",
            "Walk me through your handoff process and why thorough handoffs matter.",
            "How do you approach pain management for a patient who has a history of substance use?",
            "How do you ensure accurate documentation, and what's your process when you're time-pressured?",
        ],
        "entry-level": [
            "What clinical rotation or experience has had the biggest impact on how you approach patient care?",
            "How do you ask for help when you're uncertain about a clinical situation?",
            "What does patient-centered care mean to you in practice?",
            "Describe a moment during your training when you made a mistake. How did you handle it?",
        ],
        "mid-level": [
            "How do you prioritize your workload when every patient seems equally urgent?",
            "Tell me about a time you helped orient or mentor a new colleague.",
            "Describe a process change you initiated that improved patient outcomes or team efficiency.",
        ],
        "senior": [
            "How have you contributed to quality improvement or protocol development in your current role?",
            "Tell me about a time you led a difficult care conference with a complex family dynamic.",
            "How do you balance clinical expertise with the need to keep learning as medicine evolves?",
        ],
        "leadership": [
            "How do you build a culture of psychological safety on a clinical team?",
            "Describe how you've handled a performance issue with a direct report in a clinical setting.",
            "How do you drive adoption of a new protocol when experienced clinicians are resistant?",
        ],
    },

    "product": {
        "behavioral": [
            "Describe a product you took from concept to launch. What would you do differently in hindsight?",
            "Tell me about a time you had to say no to a feature request from a senior stakeholder. How did you handle it?",
            "Describe a time you killed a feature or significantly pivoted a roadmap based on user data.",
            "Tell me about a time a product you launched underperformed. What did you learn?",
            "Describe a situation where engineering and design were in conflict. How did you resolve it?",
        ],
        "situational": [
            "Your top three stakeholders all have conflicting priorities for next quarter. How do you build the roadmap?",
            "User retention drops significantly two weeks after a major release. Walk me through your investigation.",
            "Engineering tells you the feature you planned for this sprint will take three times as long as estimated. What do you do?",
            "You have budget to hire one person: a designer, an engineer, or a data analyst. Which do you choose and why?",
        ],
        "technical": [
            "How do you define and measure success for a new product feature?",
            "How do you gather, synthesize, and prioritize user feedback?",
            "What frameworks do you use for product prioritization, and what are their limitations?",
            "How do you work with data to validate product decisions?",
        ],
        "entry-level": [
            "What product do you use every day that you'd redesign, and what would you change?",
            "How would you go about understanding the needs of users for a product you're new to?",
            "Describe a time you identified a problem and drove a solution without being asked.",
        ],
        "mid-level": [
            "Walk me through how you write a product spec and what you include.",
            "Tell me about a time you had to push a feature through despite significant ambiguity.",
            "How do you keep your team aligned and motivated when priorities shift?",
        ],
        "senior": [
            "How do you build a product strategy that balances near-term wins with long-term vision?",
            "Tell me about a time you influenced the company's direction through a product insight.",
            "How do you scale product practices as a team grows from 5 to 50 engineers?",
        ],
        "leadership": [
            "How do you build and retain a high-performing product team?",
            "Describe how you've aligned product strategy with business strategy at an executive level.",
            "How do you create a culture of user-centricity across an entire organization?",
        ],
    },

    "design": {
        "behavioral": [
            "Walk me through your design process from initial brief to final delivery.",
            "Tell me about a time you had to defend a design decision against strong stakeholder pushback.",
            "Describe a project where user research changed your design direction significantly.",
            "Tell me about a design you're most proud of. What made it successful?",
            "Describe a time a design you created failed in production or with users. What did you learn?",
        ],
        "situational": [
            "A stakeholder asks you to implement a design direction you believe will hurt the user experience. What do you do?",
            "You have two weeks to design a major feature that would normally take six. How do you approach it?",
            "Engineering tells you your design isn't technically feasible. How do you respond?",
        ],
        "technical": [
            "How do you balance visual aesthetics with accessibility requirements?",
            "How do you incorporate usability testing into a fast-moving product cycle?",
            "What's your approach to building and maintaining a design system?",
            "How do you hand off designs to engineering in a way that minimizes back-and-forth?",
        ],
        "entry-level": [
            "Walk me through a project from your portfolio. Why did you make the choices you did?",
            "How do you incorporate feedback that you disagree with?",
            "What design tools are you most proficient in and how did you learn them?",
        ],
        "mid-level": [
            "How do you influence product direction through design, beyond just executing on briefs?",
            "Tell me about a time you identified a UX problem that no one else had noticed.",
        ],
        "senior": [
            "How do you raise the design quality bar across a product team?",
            "Describe how you've partnered with product and engineering leadership to shape strategy.",
        ],
        "leadership": [
            "How do you build a design culture in an organization that doesn't yet value design?",
            "Describe how you've grown a design team and developed individual designers.",
        ],
    },

    "finance": {
        "behavioral": [
            "Tell me about a time your financial analysis directly changed a major business decision.",
            "Describe a situation where you identified a significant financial risk that others had overlooked.",
            "Tell me about a time you had to deliver bad financial news to leadership. How did you frame it?",
            "Describe a complex financial model you built. What were the key assumptions and how did you validate them?",
        ],
        "situational": [
            "A business unit is requesting $2M in budget that isn't in the plan. How do you evaluate and respond?",
            "You're preparing the monthly close and discover a material error. What do you do?",
            "Leadership asks for a forecast by end of day with incomplete data. How do you approach it?",
        ],
        "technical": [
            "How do you communicate complex financial concepts to non-finance stakeholders?",
            "Walk me through how you would build a three-statement financial model for a new product line.",
            "How do you ensure accuracy and integrity in your financial reporting?",
        ],
        "entry-level": [
            "What financial concepts or tools have you used in coursework or internships?",
            "How do you approach reconciling numbers that don't add up?",
        ],
        "mid-level": [
            "Describe a process improvement you made to the financial close or reporting cycle.",
            "How do you partner with business leaders who don't have a finance background?",
        ],
        "senior": [
            "How have you built financial planning processes that scale with a growing business?",
            "Tell me about a time you influenced capital allocation strategy.",
        ],
        "leadership": [
            "How do you build a finance team that's seen as a strategic partner rather than a back-office function?",
            "Describe how you've managed through a financial crisis or significant budget cut.",
        ],
    },

    "education": {
        "behavioral": [
            "Describe a lesson that completely fell apart. What did you do in the moment?",
            "Tell me about a student you struggled to reach and what ultimately made a difference.",
            "Describe a time you adapted your teaching style for a student with different learning needs.",
            "Tell me about a time you had to handle a difficult parent conversation.",
            "Describe a conflict with a colleague or administrator and how you navigated it.",
        ],
        "situational": [
            "A student is consistently disruptive and affecting the rest of the class. Walk me through your approach.",
            "You notice a student showing signs of something serious — emotional distress or possible abuse. What do you do?",
            "Parents are upset that their child is failing. How do you handle that conversation?",
        ],
        "technical": [
            "How do you differentiate instruction for students who are significantly ahead or behind grade level?",
            "How do you assess whether students truly understand material versus just memorizing it?",
            "What strategies do you use to keep students engaged during longer lessons?",
        ],
        "entry-level": [
            "What inspired you to go into teaching, and what do you want your students to say about your class?",
            "How did your student teaching or practicum experience shape your approach to the classroom?",
        ],
        "mid-level": [
            "How have you contributed to curriculum development or school-wide improvement initiatives?",
            "Tell me about a time you advocated for a student within the school system.",
        ],
        "senior": [
            "How have you mentored newer teachers and helped them develop?",
            "Describe a time you led a change in teaching practice across a department or grade level.",
        ],
        "leadership": [
            "How do you build a school culture of high expectations and genuine belonging?",
            "Describe how you've managed a performance issue with a tenured teacher.",
        ],
    },

    "sales": {
        "behavioral": [
            "Walk me through the largest deal you've closed. What made it successful?",
            "Tell me about a deal you lost that you expected to win. What happened and what did you change?",
            "Describe a time you turned a skeptical or cold prospect into a paying customer.",
            "Tell me about a time you missed quota. How did you respond?",
            "Describe the hardest objection you've faced and how you handled it.",
        ],
        "situational": [
            "A prospect goes dark after three strong meetings. What's your next move?",
            "Your best prospect tells you your price is 40% higher than the competition. How do you respond?",
            "You're behind on quota with two weeks left in the quarter. What do you do?",
        ],
        "technical": [
            "Walk me through your sales process from prospecting to close.",
            "How do you build and manage your pipeline to hit consistent numbers?",
            "How do you research a prospect before the first call?",
            "What's your approach to multi-threading a deal with multiple decision-makers?",
        ],
        "entry-level": [
            "What drew you to a career in sales?",
            "Describe a time you had to be persistent to get what you wanted. How did you stay motivated?",
            "How do you handle rejection?",
        ],
        "mid-level": [
            "How do you manage a complex deal with a long sales cycle?",
            "Tell me about a time you coached or helped a junior rep improve their performance.",
        ],
        "senior": [
            "How do you build territory strategy when you're handed a new region with no relationships?",
            "Tell me about a time you influenced sales strategy or process at an organizational level.",
        ],
        "leadership": [
            "How do you hire and ramp a sales team quickly without sacrificing quality?",
            "Describe how you've managed a consistently underperforming rep.",
        ],
    },

    "customer_service": {
        "behavioral": [
            "Tell me about the most difficult customer interaction you've ever had. How did you handle it?",
            "Describe a time you turned a very unhappy customer into a loyal one.",
            "Tell me about a time you had to deliver bad news to a customer — a delay, a mistake, or a policy they wouldn't like.",
            "Describe a time you used your judgment to go outside standard policy to do right by a customer.",
        ],
        "situational": [
            "A customer is furious, screaming, and threatening to leave. Walk me through exactly how you handle it.",
            "You're handling five urgent tickets simultaneously and a VIP customer just submitted a new one. What do you do?",
            "A customer asks for something your company policy doesn't allow. What's your approach?",
        ],
        "technical": [
            "How do you balance following company policy with using personal judgment in gray-area situations?",
            "How do you ensure a customer feels heard even when you can't give them what they want?",
            "What does good documentation of a customer interaction look like, and why does it matter?",
        ],
        "entry-level": [
            "Why do you want to work in customer service?",
            "Describe a time you helped someone who was frustrated or confused. What did you do?",
        ],
        "mid-level": [
            "How have you contributed to improving a customer service process or reducing repeat contacts?",
            "Tell me about a time you identified a systemic customer pain point and escalated it.",
        ],
        "senior": [
            "How do you build a team culture that consistently delivers excellent customer experiences?",
            "Describe a time you used customer feedback data to drive a product or process change.",
        ],
        "leadership": [
            "How do you define and track customer experience quality across a large team?",
            "Describe how you've handled a major customer escalation that threatened a business relationship.",
        ],
    },

    "marketing": {
        "behavioral": [
            "Walk me through a campaign you ran from strategy to results. What worked and what didn't?",
            "Tell me about a marketing initiative that underperformed. How did you diagnose and respond?",
            "Describe a time you had to make a case for a marketing budget increase with limited data.",
            "Tell me about a time you had to align marketing strategy with a sales team that had different priorities.",
        ],
        "situational": [
            "You have a limited budget and three channels to choose from. How do you decide where to invest?",
            "A campaign goes live and early signals are much lower than projected. What do you do?",
            "A competitor launches a campaign that's gaining significant traction. How do you respond?",
        ],
        "technical": [
            "How do you measure the true ROI of a marketing initiative beyond vanity metrics?",
            "Walk me through how you build and segment an audience for a new product launch.",
            "How do you decide what content to create and in what format?",
        ],
        "entry-level": [
            "What marketing campaign — from any company — has impressed you most? Why?",
            "How do you think about the relationship between brand and performance marketing?",
        ],
        "mid-level": [
            "How do you build a content strategy that drives measurable business outcomes?",
            "Tell me about a time you successfully repositioned a product or message in the market.",
        ],
        "senior": [
            "How do you build a marketing function that's seen as a growth driver, not a cost center?",
            "Describe how you've built and scaled a demand generation engine.",
        ],
        "leadership": [
            "How do you create alignment between marketing, sales, and product on go-to-market strategy?",
            "Describe how you've built and developed a high-performing marketing team.",
        ],
    },

    "operations": {
        "behavioral": [
            "Describe a major process inefficiency you identified and how you fixed it.",
            "Tell me about a time a supply disruption or operational failure threatened your commitments. How did you respond?",
            "Describe a time you had to implement a significant process change that was met with resistance.",
            "Tell me about a time you had to make a critical decision under time pressure with limited data.",
        ],
        "situational": [
            "A key supplier just informed you they can't fulfill a critical order. You have 24 hours. What do you do?",
            "Your team is 30% behind on a key operational metric this month. What's your recovery plan?",
            "You're asked to cut operational costs by 15% without impacting service levels. How do you approach it?",
        ],
        "technical": [
            "How do you build and monitor KPIs for an operational team?",
            "Walk me through how you would map and improve an end-to-end process.",
            "How do you balance efficiency with resilience in operational planning?",
        ],
        "entry-level": [
            "Describe a time you identified a more efficient way to do something. What did you change?",
            "How do you stay organized when managing multiple tasks with competing deadlines?",
        ],
        "mid-level": [
            "Tell me about a cross-functional project you coordinated. What was hardest to manage?",
            "How have you used data to drive an operational improvement?",
        ],
        "senior": [
            "How do you design an operations organization that scales efficiently?",
            "Describe a time you drove a major operational transformation across a business.",
        ],
        "leadership": [
            "How do you build a culture of continuous improvement in an operations team?",
            "Describe how you've managed through a major operational crisis.",
        ],
    },

    "hr": {
        "behavioral": [
            "Tell me about a time you had to deliver very difficult feedback to an employee or manager.",
            "Describe a time you handled a sensitive employee relations issue. How did you navigate it?",
            "Tell me about a time a hiring manager had unrealistic expectations for a role. How did you manage it?",
            "Describe a time you had to build trust with employees who were skeptical of HR.",
        ],
        "situational": [
            "A manager comes to you wanting to let an employee go immediately with no documentation. How do you respond?",
            "You receive a complaint about a senior leader's behavior. Walk me through your process.",
            "You're asked to implement a policy change you personally disagree with. What do you do?",
        ],
        "technical": [
            "How do you design a compensation structure that's both competitive and internally equitable?",
            "Walk me through how you would run a performance improvement plan.",
            "How do you use people analytics to inform HR strategy?",
        ],
        "entry-level": [
            "Why are you drawn to a career in HR?",
            "Describe a time you helped resolve a conflict between two people.",
        ],
        "mid-level": [
            "How have you partnered with a business leader to solve a people problem?",
            "Tell me about an HR process you improved.",
        ],
        "senior": [
            "How do you build an HR function that's seen as a strategic business partner?",
            "Describe how you've built or scaled a talent acquisition capability.",
        ],
        "leadership": [
            "How do you create an employee experience strategy that drives retention and engagement?",
            "Describe how you've led organizational change in a way that brought people along rather than creating resistance.",
        ],
    },

    "analyst": {
        "behavioral": [
            "Walk me through an analysis you conducted that led to a significant business decision.",
            "Tell me about a time your analysis was wrong or your conclusions were challenged. How did you respond?",
            "Describe a time you had to present complex findings to a non-technical audience.",
            "Tell me about a time you discovered an insight in data that surprised everyone — including you.",
        ],
        "situational": [
            "You've been asked to analyze why revenue dropped 15% last month. You have two days. Walk me through your approach.",
            "Stakeholders want a recommendation but your data is inconclusive. What do you do?",
            "You realize mid-project that the data you've been given is incomplete or possibly incorrect. What do you do?",
        ],
        "technical": [
            "How do you validate the quality and completeness of data before building on top of it?",
            "Walk me through how you would structure an A/B test for a product change.",
            "How do you decide which metrics matter and which ones are distractions?",
        ],
        "entry-level": [
            "Describe an analysis you did on your own — personal project, coursework, or internship.",
            "How do you approach a dataset you've never seen before?",
        ],
        "mid-level": [
            "Tell me about a time you influenced a product or business decision through data.",
            "How do you handle stakeholders who want to see different conclusions than the data supports?",
        ],
        "senior": [
            "How do you build an analytics function that proactively surfaces insights rather than just answering questions?",
            "Describe a time you changed how an organization uses data.",
        ],
        "leadership": [
            "How do you build a data-driven culture across teams that aren't naturally analytical?",
            "Describe how you've built and led an analytics team.",
        ],
    },

    "project_mgmt": {
        "behavioral": [
            "Tell me about the most complex project you've managed. What made it hard and how did you keep it on track?",
            "Describe a project that went significantly off-scope or off-schedule. What happened and what did you do?",
            "Tell me about a time you had to manage conflict between key project stakeholders.",
            "Describe a time a project you led failed. What did you learn?",
        ],
        "situational": [
            "Two weeks before a go-live, a critical dependency slips. Walk me through your response.",
            "Your project sponsor suddenly loses interest and stops showing up to reviews. How do you handle it?",
            "Your team estimates a task will take 6 weeks but the business needs it in 3. What do you do?",
        ],
        "technical": [
            "How do you manage project risks and what does your risk register process look like?",
            "How do you run a post-mortem so it produces real change rather than just documentation?",
            "What's your approach to stakeholder communication when things aren't going well?",
        ],
        "entry-level": [
            "Describe a time you coordinated a group of people toward a shared goal.",
            "How do you stay organized when juggling multiple moving pieces?",
        ],
        "mid-level": [
            "How do you keep a project team motivated during a difficult stretch?",
            "Tell me about a scope creep situation and how you managed it.",
        ],
        "senior": [
            "How do you manage a portfolio of projects with competing resource demands?",
            "Describe a time you drove a major organizational change through project delivery.",
        ],
        "leadership": [
            "How do you build a PMO that adds real value rather than just overhead?",
            "Describe how you've developed project management capability across an organization.",
        ],
    },

    "consulting": {
        "behavioral": [
            "Walk me through a client engagement where you had to reframe the problem. What led you to change direction?",
            "Tell me about a time a client pushed back hard on your recommendation. How did you respond?",
            "Describe a time you had to build credibility quickly with a skeptical client.",
            "Tell me about a project where the findings were uncomfortable for the client. How did you handle it?",
        ],
        "situational": [
            "Midway through an engagement you discover the original problem statement was wrong. What do you do?",
            "A client wants to implement a recommendation you believe will fail. How do you proceed?",
            "You're presenting findings and the senior client starts challenging your methodology in front of the team. How do you respond?",
        ],
        "technical": [
            "How do you structure a problem you've never seen before?",
            "Walk me through how you build a slide or recommendation that tells a clear story.",
            "How do you ensure your recommendations are actually implemented after the engagement ends?",
        ],
        "entry-level": [
            "Walk me through how you would approach estimating market size for a product you know nothing about.",
            "What draws you to consulting as a career?",
        ],
        "mid-level": [
            "How do you manage client relationships day-to-day on a long engagement?",
            "Tell me about a time you identified a problem the client didn't realize they had.",
        ],
        "senior": [
            "How do you build a long-term client relationship that goes beyond the current engagement?",
            "Describe how you've developed junior consultants on your team.",
        ],
        "leadership": [
            "How do you build and grow a practice or service line?",
            "Describe how you've handled a client relationship that was at risk of ending.",
        ],
    },

    "general": {
        "behavioral": [
            "Tell me about the most challenging professional situation you've faced and how you handled it.",
            "Describe a time you had to work with someone whose style was very different from yours.",
            "Tell me about a time you took on a responsibility outside your job description and what happened.",
            "Describe a significant professional failure and what you did differently afterward.",
            "Tell me about a time you had to manage competing priorities under a tight deadline.",
            "Describe a situation where you had to influence someone without having authority over them.",
            "Tell me about a time you disagreed with your manager's direction. How did you handle it?",
        ],
        "situational": [
            "You're three days from a key deadline and realize the deliverable is at serious risk. What do you do?",
            "A colleague is clearly struggling but hasn't asked for help. How do you approach it?",
            "You've been given a project with an unclear scope and conflicting stakeholder expectations. Where do you start?",
        ],
        "technical": [
            "How do you approach a problem you've never encountered before?",
            "How do you ensure the quality of your work when you're under time pressure?",
            "How do you stay current in your field and continue developing professionally?",
        ],
        "entry-level": [
            "What experience — academic, professional, or personal — has best prepared you for this role?",
            "How would you approach your first 30 days in a new position to get up to speed quickly?",
            "What's an area you're actively working to improve, and what are you doing about it?",
        ],
        "mid-level": [
            "Describe a project where you owned the outcome end-to-end. What would you do differently?",
            "How have you helped grow or develop a less experienced colleague?",
        ],
        "senior": [
            "Tell me about a time you drove significant change in an organization.",
            "How do you make high-stakes decisions with incomplete information?",
        ],
        "leadership": [
            "How do you build trust with a new team quickly?",
            "Describe how you've developed a culture of accountability and growth.",
        ],
    },
}


def _generate_questions(job_type: str, experience_level: str, focus_areas: list[str], count: int) -> list[str]:
    role = job_type.strip() or "this role"
    category = _categorize(job_type)
    bank = QUESTION_BANK.get(category, QUESTION_BANK["general"])
    level = experience_level.lower()
    fa = [f.lower().strip() for f in focus_areas]

    pool: list[str] = []

    # Determine which pools to include based on focus areas
    use_behavioral  = not fa or any(x in fa for x in ("behavioral", "general", "soft skills"))
    use_situational = not fa or any(x in fa for x in ("situational", "problem solving", "problem-solving", "scenarios"))
    use_technical   = not fa or any(x in fa for x in ("technical", "domain", "skills", "hard skills"))

    if use_behavioral:
        pool += bank.get("behavioral", [])
    if use_situational:
        pool += bank.get("situational", [])
    if use_technical:
        pool += bank.get("technical", [])

    # Always add level-specific questions
    pool += bank.get(level, bank.get("mid-level", []))

    # If pool is still thin, pull from general
    if len(pool) < count:
        general = QUESTION_BANK["general"]
        if use_behavioral:
            pool += general.get("behavioral", [])
        if use_situational:
            pool += general.get("situational", [])
        pool += general.get(level, general.get("mid-level", []))

    # Deduplicate
    seen: set[str] = set()
    unique: list[str] = []
    for q in pool:
        if q not in seen:
            seen.add(q)
            unique.append(q)

    random.shuffle(unique)
    return unique[:count]


LEVEL_CONTEXT = {
    "entry-level": (
        "The candidate is a new graduate or has 0–2 years of experience. "
        "They likely have internship or academic project experience but no deep professional track record. "
        "Ask questions that explore potential, learning agility, and foundational understanding. "
        "Do NOT ask them to describe leading teams, managing budgets, or making high-stakes business decisions. "
        "Questions should be answerable from coursework, side projects, internships, or part-time work."
    ),
    "mid-level": (
        "The candidate has 2–5 years of professional experience in this role. "
        "They can work independently, have owned projects from start to finish, and have collaborated across teams. "
        "Ask about real examples of ownership, problem-solving, and delivering results. "
        "Some mentorship of juniors is fair to explore but they are not yet an organizational leader."
    ),
    "senior": (
        "The candidate has 5–10+ years of experience and operates at a high level of autonomy. "
        "They've made significant technical or strategic decisions, influenced direction without formal authority, "
        "and mentored or elevated others. Ask about high-impact contributions, trade-offs at scale, "
        "and situations where their judgment materially changed an outcome."
    ),
    "leadership": (
        "The candidate leads a team or organization in this function. "
        "Their day-to-day is about people: hiring, developing, aligning, and holding accountable. "
        "Ask about how they build culture, drive strategy, handle underperformers, navigate executive dynamics, "
        "and scale organizations. Their answers should demonstrate people leadership, not just personal execution."
    ),
}

def _parse_questions(text: str) -> list[str]:
    text = text.strip()
    text = re.sub(r"^```[a-z]*\n?", "", text)
    text = re.sub(r"\n?```$", "", text)
    text = text.strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return parsed
    except json.JSONDecodeError:
        pass
    m = re.search(r"\[.*?\]", text, re.DOTALL)
    if m:
        try:
            parsed = json.loads(m.group())
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            pass
    return []


async def generate_interview_questions(
    job_type: str,
    experience_level: str = "mid-level",
    focus_areas: list[str] | None = None,
    count: int = 8,
) -> list[str]:
    focus = focus_areas or []
    client = get_groq_client()

    if client is None:
        # No API key — use the local question bank
        return _generate_questions(job_type, experience_level, focus, count)

    level_ctx = LEVEL_CONTEXT.get(experience_level.lower(), LEVEL_CONTEXT["mid-level"])
    focus_str = ", ".join(focus) if focus else "behavioral, situational, and role-specific"

    prompt = f"""You are an expert hiring manager writing interview questions for a {job_type} role.

EXPERIENCE LEVEL: {experience_level}
LEVEL REQUIREMENT: {level_ctx}

FOCUS AREAS: {focus_str}
ROLE: {job_type}
NUMBER OF QUESTIONS: {count}

Write exactly {count} interview questions that:
1. Are specifically about the {job_type} role — reference its real responsibilities, tools, domain, or challenges. Never write a question that could apply to any job.
2. Are calibrated precisely for {experience_level}: {level_ctx}
3. Cover a mix of types from the focus areas ({focus_str}): behavioral (past experience using STAR), situational (what would you do if...), and domain/competency questions.
4. Sound like questions a real hiring manager would ask in an actual interview — direct, specific, and challenging.
5. Are CLEARLY DIFFERENT from what you'd ask someone at a different level for the same role.

Return ONLY a JSON array of {count} strings. No markdown, no numbering, no explanation.
["Question 1?", "Question 2?", ...]"""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.85,
            max_tokens=1200,
        )
        raw = response.choices[0].message.content or ""
        questions = [q.strip() for q in _parse_questions(raw) if isinstance(q, str) and q.strip()]

        if len(questions) >= max(1, count // 2):
            return questions[:count]
    except Exception:
        pass

    # Groq call failed — fall back to local bank
    return _generate_questions(job_type, experience_level, focus, count)
