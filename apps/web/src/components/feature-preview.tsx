"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductNav } from "./product-nav";

type FeatureKey = "messages" | "household" | "compatibility" | "stories" | "trustscore" | "agreement" | "personality";
const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const stories = [
  { name: "Ananya", room: "A slower Sunday", photo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85" },
  { name: "Rohan", room: "Room tour", photo: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85" },
  { name: "Mira", room: "Our favourite corner", photo: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85" },
];
const people = [
  { name: "Ananya Mehta", city: "Indiranagar, Bengaluru", initial: "A", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=75", message: "That sounds lovely, shall we plan a visit?", status: "Online · sample status" },
  { name: "Rohan Iyer", city: "Baner, Pune", initial: "R", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=75", message: "I’m also looking near the metro.", status: "Recently active · sample" },
  { name: "Mira Shah", city: "Powai, Mumbai", initial: "M", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=75", message: "Thanks for the intro!", status: "Online · sample status" },
];
const choresSeed = ["Kitchen reset · Ananya", "Living room · Rohan", "Take out recycling · You", "Bathroom refresh · Mira"];
const agreementTerms = ["Monthly rent sharing", "Cleaning responsibilities", "Guest policies", "Quiet hours", "Shared expenses", "Move-in and move-out dates"];
const questions = [
  { title: "How do you like shared spaces to feel?", answers: ["Tidy every day", "Weekly reset works", "Relaxed and respectful"] },
  { title: "What is your sleep rhythm?", answers: ["Early nights", "Late nights", "It changes"] },
  { title: "How do you feel about guests?", answers: ["A heads-up first", "Friends are welcome", "Mostly quiet at home"] },
  { title: "What is your food routine?", answers: ["I cook most days", "A mix of cooking and ordering", "Mostly my own routine"] },
  { title: "What is your preferred noise level?", answers: ["Quiet and calm", "Some music and conversation", "Headphones when needed"] },
  { title: "How much personal space do you need?", answers: ["A lot of solo time", "A good balance", "I enjoy shared time"] },
];

const pages: Record<FeatureKey, { eyebrow: string; title: string; copy: string; nav: string; badge: string }> = {
  messages: { eyebrow: "YOUR CONNECTIONS", title: "Messages & matches", copy: "Get to know your future flatmates, one conversation at a time.", nav: "Messages", badge: "SAMPLE CONVERSATIONS" },
  household: { eyebrow: "YOUR SHARED HOME", title: "A home that runs smoothly.", copy: "Keep shared costs and everyday tasks clear for everyone.", nav: "Household", badge: "LOCAL PREVIEW · NOT SYNCED" },
  compatibility: { eyebrow: "AI MATCHING", title: "Compatibility, with more context.", copy: "Compare the routines and preferences that shape a shared home.", nav: "Discover", badge: "ILLUSTRATIVE SCORE · NOT CALCULATED" },
  stories: { eyebrow: "LIFE, SHARED", title: "Roommate stories.", copy: "Room tours, little rituals, and places people love.", nav: "Discover", badge: "SAMPLE STORY PREVIEW" },
  trustscore: { eyebrow: "TRUST & TRANSPARENCY", title: "Trust, made clear.", copy: "See which details are confirmed and which still need a real verification flow.", nav: "Household", badge: "NO TRUST SCORE IS CALCULATED" },
  agreement: { eyebrow: "ROOMMATE AGREEMENT", title: "Start with shared expectations.", copy: "A clear conversation can make the everyday feel easier.", nav: "Household", badge: "DEMO TEMPLATE · NOT LEGAL ADVICE" },
  personality: { eyebrow: "PERSONALITY COMPATIBILITY", title: "What feels like home to you?", copy: "A few quick questions about the rhythms of shared living.", nav: "Profile", badge: "LOCAL PREVIEW · ANSWERS ARE NOT SAVED" },
};

export default function FeaturePreview({ feature }: { feature: string }) {
  const key = feature as FeatureKey;
  const page = pages[key];
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [attachmentNotice, setAttachmentNotice] = useState(false);
  const [section, setSection] = useState<"expenses" | "chores">("expenses");
  const [expenses, setExpenses] = useState([{ name: "Rent", amount: 18000 }, { name: "Electricity", amount: 2000 }, { name: "Wi-Fi", amount: 999 }, { name: "Groceries", amount: 4500 }]);
  const [chores, setChores] = useState(choresSeed);
  const [doneChores, setDoneChores] = useState<number[]>([1]);
  const [history, setHistory] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState(false);
  const [acknowledgements, setAcknowledgements] = useState<number[]>([]);
  const [agreementMessage, setAgreementMessage] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [reaction, setReaction] = useState("");
  const [reply, setReply] = useState("");
  const [storyNotice, setStoryNotice] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const total = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);

  if (!page) return null;

  function sendMessage() {
    if (!message.trim()) return;
    setSentMessages((current) => [...current, message.trim()]);
    setMessage("");
  }
  function addReply() {
    if (!reply.trim()) return;
    setStoryNotice(`Your preview reply: “${reply.trim()}”`);
    setReply("");
  }
  function toggleAcknowledgement(index: number) {
    setAcknowledgements((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
  }

  return (
    <main className="product-page">
      <ProductNav active={page.nav} />
      <div className="feature-shell">
        <section className="feature-heading"><p className="dashboard-kicker">{page.eyebrow}</p><h1>{result && key === "personality" ? "Your home style." : page.title}</h1><p>{page.copy}</p><span className="preview-chip">{page.badge}</span></section>

        {key === "messages" ? <section className="feature-card message-feature">
          {selectedPerson === null ? <><div className="feature-section-title"><h2>Recent conversations</h2><Link href="/matches">View real matches ↗</Link></div><div className="message-list">{people.map((person, index) => <button className="message-row" key={person.name} type="button" onClick={() => { setSelectedPerson(index); setSentMessages([]); }}><span className="message-avatar" style={{ backgroundImage: `url("${person.photo}")` }}><i /></span><span className="message-person"><strong>{person.name}</strong><small>{person.city} · sample</small><span>{person.message}</span></span><span className="message-row-time">{index === 0 ? "2m" : index === 1 ? "1h" : "1d"}</span></button>)}</div><div className="feature-subcard feature-safety"><strong>Meet thoughtfully</strong><p>Keep early conversations in the app and meet in a public place. Report and block tools are not connected yet.</p></div></> : <><button className="feature-back" type="button" onClick={() => setSelectedPerson(null)}>← All messages</button><div className="message-chat-head"><span className="message-avatar" style={{ backgroundImage: `url("${people[selectedPerson].photo}")` }}><i /></span><span><strong>{people[selectedPerson].name}</strong><small>{people[selectedPerson].status}</small></span><b>MATCH</b></div><div className="message-bubbles"><span className="message-date">TODAY · SAMPLE CHAT</span><p className="bubble incoming">Hi! I saw we’re both looking around {people[selectedPerson].city.split(",")[1]?.trim()}. What kind of home are you hoping to find?</p><p className="bubble outgoing">A bright shared place with a friendly, considerate vibe. How about you?</p><p className="bubble incoming">{people[selectedPerson].message}</p>{sentMessages.map((text, index) => <p className="bubble outgoing" key={`${text}-${index}`}>{text}</p>)}</div><div className="message-composer"><button type="button" aria-label="Attach image" onClick={() => setAttachmentNotice((value) => !value)}>＋</button><input aria-label="Write a message" placeholder="Write a message…" value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} /><button type="button" className="message-send" onClick={sendMessage} aria-label="Send message">↑</button></div>{attachmentNotice ? <p className="preview-help">Image sending is a preview only. No file is selected or sent.</p> : null}<p className="preview-help">Messages in this screen are local examples and are not sent or stored.</p></>}
        </section> : null}

        {key === "household" ? <>
          <section className="household-summary"><div><p className="dashboard-kicker">TOTAL HOUSEHOLD EXPENSES</p><strong>{currency.format(total)}</strong><span>This month · example household</span></div><div className="household-stats"><span><small>YOUR CONTRIBUTION</small><b>{currency.format(Math.round(total / 4))}</b></span><span><small>PENDING</small><b className="neon-text">{currency.format(2000)}</b></span></div></section>
          <div className="feature-tabs" role="tablist"><button type="button" aria-selected={section === "expenses"} onClick={() => setSection("expenses")}>Splitmate · expenses</button><button type="button" aria-selected={section === "chores"} onClick={() => setSection("chores")}>ChoreMate · tasks</button></div>
          {section === "expenses" ? <><div className="feature-action-row"><button className="dashboard-primary" type="button" onClick={() => setExpenses((current) => [...current, { name: "Household supplies", amount: 500 }])}>＋ Add expense</button><button className="feature-secondary" type="button" onClick={() => setStoryNotice(`${currency.format(total)} split across 4 members = ${currency.format(Math.round(total / 4))} each · sample calculation.`)}>Split expense</button><button className="feature-secondary" type="button" onClick={() => setHistory((value) => !value)}>View history</button></div><div className="feature-card expense-list"><h2>Shared expenses</h2>{expenses.map((expense, index) => <div className="expense-row" key={`${expense.name}-${index}`}><span className={`expense-icon expense-color-${index % 4}`}>{["⌂", "ϟ", "⌁", "◉"][index % 4]}</span><span><strong>{expense.name}</strong><small>{index === 0 ? "HOUSING" : index === 1 ? "UTILITIES" : index === 2 ? "UTILITIES" : "SHARED"} · SAMPLE</small></span><b>{currency.format(expense.amount)}</b></div>)}</div>{history ? <div className="feature-subcard"><strong>Recent activity</strong><p>Today · Shared groceries · ₹4,500 (sample)</p><p>Yesterday · Electricity · ₹2,000 (sample)</p></div> : null}<section className="feature-card"><h2>Member balances</h2><div className="member-balances">{["You", "Ananya", "Rohan", "Mira"].map((person, index) => <div key={person}><span>{person[0]}</span><strong>{person}</strong><small>{index === 0 ? "Settled" : "₹2,000 due"}</small></div>)}</div></section></> : <><div className="household-stats chore-progress"><span><small>THIS WEEK</small><b>{doneChores.length} of {chores.length} tasks complete</b></span><strong>{chores.length ? Math.round(doneChores.length / chores.length * 100) : 0}%</strong><div className="progress-track"><i style={{ width: `${chores.length ? doneChores.length / chores.length * 100 : 0}%` }} /></div></div><div className="feature-section-title"><h2>Weekly cleaning schedule</h2><button type="button" onClick={() => setChores((current) => [...current, "Wipe kitchen counters · You"])}>＋ Add task</button></div><div className="feature-card chores-list">{chores.map((task, index) => <button type="button" key={`${task}-${index}`} onClick={() => setDoneChores((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])} className="chore-row"><span className={doneChores.includes(index) ? "task-check is-done" : "task-check"}>{doneChores.includes(index) ? "✓" : ""}</span><span><strong className={doneChores.includes(index) ? "task-done" : ""}>{task.split(" · ")[0]}</strong><small>ASSIGNED TO {task.split(" · ")[1].toUpperCase()}</small></span><small>{["MON", "TUE", "WED", "SAT"][index % 4]}</small></button>)}</div><div className="feature-subcard"><strong>Gentle reminder</strong><p>A quick kitchen reset is planned for tomorrow · sample reminder</p></div></>}
          {storyNotice ? <p className="preview-help" role="status">{storyNotice}</p> : null}
          <div className="feature-links"><Link href="/agreement">Roommate agreement <span>↗</span></Link><Link href="/trustscore">Trust & verification <span>↗</span></Link><Link href="/personality">Lifestyle questionnaire <span>↗</span></Link></div>
          <p className="preview-help">All amounts, members, and tasks are examples. Changes stay in this browser session only.</p>
        </> : null}

        {key === "compatibility" ? <><section className="compatibility-score-card"><div className="compatibility-ring"><strong>92<span>%</span></strong><small>SAMPLE</small></div><h2>Your lifestyles match. You could be great flatmates.</h2><p>This example score is illustrative only. The app does not calculate compatibility yet.</p></section><div className="feature-card compatibility-factors"><h2>What could fit well</h2>{[{ label: "Budget match", value: 95, text: "Comfortable monthly range" }, { label: "Location match", value: 88, text: "Preferred areas overlap" }, { label: "Lifestyle match", value: 91, text: "Similar home routines" }, { label: "Sleep schedule", value: 84, text: "Early bird · flexible" }, { label: "Cleanliness", value: 93, text: "Shared-space expectations" }, { label: "Food preferences", value: 78, text: "Room for different tastes" }].map((item) => <div className="compatibility-factor" key={item.label}><span><strong>{item.label}</strong><small>{item.text}</small></span><b>{item.value}%</b><i><em style={{ width: `${item.value}%` }} /></i></div>)}</div><div className="feature-subcard"><strong>Compare thoughtfully</strong><p>Compatibility should start a conversation, not make the decision for you.</p><Link href="/flatmates">Browse flatmates <span>↗</span></Link></div></> : null}

        {key === "stories" ? <><div className="story-selector">{stories.map((story, index) => <button type="button" key={story.name} aria-pressed={storyIndex === index} onClick={() => { setStoryIndex(index); setReaction(""); }}><span style={{ backgroundImage: `url("${story.photo}")` }} /><strong>{story.name}</strong></button>)}</div><section className="story-feature" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.8),rgba(0,0,0,.08)),url("${stories[storyIndex].photo}")` }}><span className="preview-chip">SAMPLE STORY</span><div><strong>{stories[storyIndex].name}</strong><p>{stories[storyIndex].room}</p><button type="button" onClick={() => setStoryIndex((value) => (value + 1) % stories.length)}>Next story ↗</button></div></section><div className="feature-card story-reactions"><strong>Send a reaction</strong>{["♥", "☺", "✦", "👏"].map((emoji) => <button type="button" aria-pressed={reaction === emoji} onClick={() => setReaction(emoji)} key={emoji}>{emoji}</button>)}</div><div className="message-composer"><input aria-label="Reply to story" placeholder="Reply to this story…" value={reply} onChange={(event) => setReply(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addReply(); }} /><button className="message-send" type="button" onClick={addReply}>↑</button></div><button className="feature-secondary" type="button" onClick={() => setStoryNotice("Story upload and publishing are not connected yet.")}>＋ Add your story</button>{storyNotice ? <p className="preview-help" role="status">{storyNotice}</p> : null}{reaction ? <p className="preview-help" role="status">Reaction {reaction} added to this local preview.</p> : null}<p className="preview-help">Replies and reactions stay in this browser. Story publishing and video playback are not connected.</p></> : null}

        {key === "trustscore" ? <><section className="feature-subcard trust-summary"><span>◈</span><div><strong>No completed verification is recorded here.</strong><p>A trust score is not calculated.</p></div></section><div className="feature-card verification-list"><h2>Verification checklist</h2>{[{ title: "Email address", status: "Status unavailable", detail: "Account email exists; confirmation data is not exposed to the app." }, { title: "Phone number", status: "Not connected", detail: "No phone verification flow is currently available." }, { title: "Identity", status: "Not started", detail: "Identity documents are not collected or checked." }, { title: "Property listings", status: "Not verified", detail: "Listing verification is not implemented yet." }].map((item) => <div key={item.title}><span>◈</span><p><strong>{item.title}</strong><b>{item.status}</b><small>{item.detail}</small></p></div>)}</div><div className="feature-subcard"><strong>Stay in control</strong><p>Report and block actions will be available when connected to safety tools.</p><button className="feature-secondary" type="button" onClick={() => setReportOpen((value) => !value)}>Report or block controls</button>{reportOpen ? <small className="preview-help">These controls are not connected and no report or block was submitted.</small> : null}</div><p className="preview-help">Badges only appear after a check is completed and recorded.</p></> : null}

        {key === "agreement" ? <><div className="agreement-facts"><article><small>MONTHLY RENT SHARE</small><strong>₹7,125 each · sample</strong></article><article><small>MOVE-IN DATE</small><strong>To be agreed</strong></article><article><small>MOVE-OUT DATE</small><strong>To be agreed</strong></article><article><small>HOUSEHOLD MEMBERS</small><strong>4 · sample household</strong></article></div><section className="feature-card agreement-list"><h2>Talk through these together</h2>{agreementTerms.map((term, index) => <label key={term} className="agreement-row"><input type="checkbox" checked={acknowledgements.includes(index)} onChange={() => toggleAcknowledgement(index)} /><span><strong>{term}</strong><small>{["Agree how rent is divided and when each share is due.", "Set a fair rota for shared spaces and weekly tasks.", "Discuss advance notice and overnight guests.", "Choose hours that respect sleep and work routines.", "Decide how utilities and household purchases are recorded.", "Record intended dates and notice expectations."][index]}</small></span></label>)}</section><button className="dashboard-primary" type="button" disabled={acknowledgements.length < agreementTerms.length} onClick={() => setAgreementMessage(true)}>Acknowledge preview</button>{agreementMessage ? <p className="preview-help">This acknowledgement is local to the preview and is not signed, shared, or legally binding.</p> : null}<p className="preview-help">No agreement, signature, date, or acknowledgement is saved by this prototype.</p></> : null}

        {key === "personality" ? <>{!result ? <><div className="question-progress"><span>YOUR PROGRESS</span><strong>{Object.keys(answers).length} / {questions.length}</strong><i><em style={{ width: `${Object.keys(answers).length / questions.length * 100}%` }} /></i></div>{questions.map((question, index) => <section className="feature-card personality-question" key={question.title}><small>QUESTION {String(index + 1).padStart(2, "0")}</small><h2>{question.title}</h2><div>{question.answers.map((answer, choice) => <button type="button" aria-pressed={answers[index] === choice} key={answer} onClick={() => setAnswers((current) => ({ ...current, [index]: choice }))}>{answer}</button>)}</div></section>)}<button className="dashboard-primary" type="button" disabled={Object.keys(answers).length < questions.length} onClick={() => setResult(true)}>See my result ↗</button></> : <section className="compatibility-score-card"><span className="preview-chip">SAMPLE RESULT</span><h2>Thoughtful home balancer</h2><p>You value a home where people communicate clearly and respect each other’s routines. Use this as a conversation starter, not a compatibility verdict.</p><button className="feature-secondary" type="button" onClick={() => setResult(false)}>Review my answers</button></section>}<p className="preview-help">Answers stay in this browser session and are not used to rank people.</p></> : null}
      </div>
    </main>
  );
}
