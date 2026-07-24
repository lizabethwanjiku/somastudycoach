/*
  Starter app map

  This file connects the page to the data and to /api/coach:
  1. Read HTML elements by id.
  2. Fill the setup dropdowns from starter/data.js.
  3. Build a safe context object from the selected topic and question.
  4. Send that context to /api/coach.
  5. Render the structured response and local progress.

  Beginner rule: if you rename an id in starter/index.html, update the matching
  document.getElementById call below.
*/

const modeSelect = document.getElementById("modeSelect");
const gradeSelect = document.getElementById("gradeSelect");
const learningAreaSelect = document.getElementById("learningAreaSelect");
const topicSelect = document.getElementById("topicSelect");
const topicCard = document.getElementById("topicCard");
const studentQuestionInput = document.getElementById("studentQuestionInput");
const sampleButton = document.getElementById("sampleButton");
const previewButton = document.getElementById("previewButton");
const coachButton = document.getElementById("coachButton");
const resetButton = document.getElementById("resetButton");
const contextBadge = document.getElementById("contextBadge");
const contextPreview = document.getElementById("contextPreview");
const coachStatus = document.getElementById("coachStatus");
const responseOutput = document.getElementById("responseOutput");
const planOutput = document.getElementById("planOutput");
const clearProgressButton = document.getElementById("clearProgressButton");
const followUpInput = document.getElementById("followUpInput");
const followUpButton = document.getElementById("followUpButton");
const followUpOutput = document.getElementById("followUpOutput");

const progressStorageKey = "soma-starter.plan-progress.v1";
let lastContext = null;
let lastResponse = null;

// Prevent user text from being treated as HTML when we render it on the page.
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Reusable helper for turning data.js objects into dropdown <option> tags.
function optionHtml(option) {
  return `<option value="${escapeHtml(option.id)}">${escapeHtml(option.label || option.topic)}</option>`;
}

// Find the selected object in a list. Falls back to the first item for safety.
function getSelected(collection, selectElement) {
  return collection.find(item => item.id === selectElement.value) || collection[0];
}

function getTopic() {
  return getSelected(topicPacks, topicSelect);
}

function renderSelects() {
  modeSelect.innerHTML = setupOptions.modes.map(optionHtml).join("");
  gradeSelect.innerHTML = setupOptions.grades.map(optionHtml).join("");
  learningAreaSelect.innerHTML = setupOptions.learningAreas.map(optionHtml).join("");
  topicSelect.innerHTML = topicPacks.map(optionHtml).join("");
}

// Update the topic summary card whenever the selected topic changes.
function renderTopicCard() {
  const topic = getTopic();
  topicCard.innerHTML = `
    <h3>${escapeHtml(topic.topic)}</h3>
    <p>${escapeHtml(topic.summary)}</p>
    <p><strong>Example:</strong> ${escapeHtml(topic.examples[0])}</p>
  `;
  studentQuestionInput.placeholder = topic.sampleQuestion;
}

/*
  Extension point: this is the main safe-context builder.

  Add new fields here when your project needs more topic data, but keep personal
  data out. The browser sends this object to /api/coach; it should contain only
  the learner's study question plus safe dummy/sample context.
*/
function buildContext() {
  const grade = getSelected(setupOptions.grades, gradeSelect);
  const learningArea = getSelected(setupOptions.learningAreas, learningAreaSelect);
  const topic = getTopic();

  return {
    mode: modeSelect.value,
    studentSetup: {
      grade: grade.grade,
      gradeBand: grade.gradeBand,
      ageRange: grade.ageRange,
      learningArea: learningArea.label,
      topic: topic.topic,
      studyNeed: topic.studyNeed
    },
    studentQuestion: studentQuestionInput.value.trim(),
    practiceAnswers: [],
    curriculumContext: {
      sourceLabel: "Simplified KICD/CBC-aligned sample snippets for workshop use",
      snippets: [
        {
          strand: topic.strand,
          topic: topic.topic,
          summary: topic.summary,
          vocabulary: topic.vocabulary,
          examples: topic.examples,
          misconceptions: topic.misconceptions
        }
      ],
      constraints: [
        "Use dummy/sample learner data only.",
        "Do not request or store names, schools, marks, phone numbers, or private records.",
        "Give study support, not official marks or diagnosis."
      ]
    },
    resources: topic.resources,
    followUpQuestion: ""
  };
}

// Show students exactly what would be sent before making an AI/provider call.
function previewContext() {
  const context = buildContext();
  contextPreview.textContent = JSON.stringify(context, null, 2);
  contextBadge.textContent = "Preview ready";
}

// Badge helper used by the main coach status label.
function setCoachStatus(text, className = "") {
  coachStatus.textContent = text;
  coachStatus.className = `badge ${className}`.trim();
}

// /api/coach fields may come back as strings or arrays; normalize to arrays.
function normalizeList(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

// Keep rendering stable even if mock mode and provider mode differ slightly.
function normalizeResponse(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("The proxy returned an unexpected response shape.");
  }

  return {
    studyFeedback: String(payload.studyFeedback || "").trim(),
    socraticPrompt: String(payload.socraticPrompt || "").trim(),
    topicExplanation: String(payload.topicExplanation || "").trim(),
    examples: normalizeList(payload.examples),
    misconceptionHelp: normalizeList(payload.misconceptionHelp),
    recommendedResources: normalizeList(payload.recommendedResources),
    sevenDayPlan: normalizeList(payload.sevenDayPlan),
    followUpAnswer: String(payload.followUpAnswer || "").trim(),
    limitations: String(payload.limitations || "").trim()
  };
}

/*
  The only network call in the starter.

  The browser calls our own server endpoint, not Gemini directly. That keeps
  provider keys server-side and lets mock mode work with no API key.
*/
async function askStudyCoach(context) {
  const response = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(context)
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("No /api/coach endpoint is running.");
    }
    if (response.status === 429) {
      throw new Error("The configured coach quota or rate limit was reached.");
    }
    if (response.status === 400) {
      throw new Error("The request was blocked. Check for personal data.");
    }
    throw new Error(`The coach endpoint is unavailable. HTTP ${response.status}.`);
  }

  return normalizeResponse(await response.json());
}

// Convert response arrays into simple list HTML for the starter UI.
function listHtml(items) {
  if (!items.length) {
    return "<li>No items returned.</li>";
  }
  return items.map(item => {
    if (typeof item === "string") {
      return `<li>${escapeHtml(item)}</li>`;
    }
    return `<li><strong>${escapeHtml(item.title || item.topic || item.day || "Item")}:</strong> ${escapeHtml(item.text || item.description || item.reason || item.task || item.activity || item.focus || "")}</li>`;
  }).join("");
}

// Main response renderer. Add new output sections here after /api/coach returns them.
function renderResponse(result) {
  responseOutput.className = "results";
  responseOutput.innerHTML = `
    <section class="summary">
      <h3>Study feedback</h3>
      <p>${escapeHtml(result.studyFeedback || "Study support returned by /api/coach.")}</p>
    </section>
    <article class="card">
      <h3>Soma asks back</h3>
      <p>${escapeHtml(result.socraticPrompt || "Before Soma explains more, what do you already think?")}</p>
    </article>
    <article class="card">
      <h3>Topic explanation</h3>
      <p>${escapeHtml(result.topicExplanation || "No topic explanation returned.")}</p>
    </article>
    <article class="card">
      <h3>Examples</h3>
      <ul>${listHtml(result.examples)}</ul>
    </article>
    <article class="card">
      <h3>Misconception help</h3>
      <ul>${listHtml(result.misconceptionHelp)}</ul>
    </article>
    <article class="card">
      <h3>Resources</h3>
      <ul>${listHtml(result.recommendedResources)}</ul>
    </article>
    <article class="card">
      <h3>7-day plan</h3>
      <ul>${listHtml(result.sevenDayPlan)}</ul>
    </article>
    <p class="note">${escapeHtml(result.limitations || "Demo output is study support from dummy data. Check important learning decisions with a teacher or mentor.")}</p>
  `;
  renderPlan(result.sevenDayPlan);
}

// Local progress is stored only in this browser. It is not sent to /api/coach.
function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(progressStorageKey) || "{}");
  } catch {
    return {};
  }
}

function writeProgress(progress) {
  localStorage.setItem(progressStorageKey, JSON.stringify(progress));
}

// Accept plan items as either strings or objects so students can experiment.
function normalizePlanItem(item, index) {
  if (typeof item === "string") {
    return { day: index + 1, title: `Day ${index + 1}`, task: item };
  }
  return {
    day: item.day || index + 1,
    title: item.title || `Day ${item.day || index + 1}`,
    task: item.task || item.activity || item.action || item.text || "Review the selected topic."
  };
}

// Render the 7-day plan and restore checked boxes from localStorage.
function renderPlan(planItems) {
  if (!planItems.length) {
    planOutput.className = "empty-state";
    planOutput.textContent = "No study plan returned yet.";
    return;
  }

  const progress = readProgress();
  const items = planItems.map(normalizePlanItem);
  planOutput.className = "results";
  planOutput.innerHTML = items.map((item, index) => {
    const id = `${item.day}-${item.title}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `
      <label class="plan-item">
        <input type="checkbox" data-plan-id="${escapeHtml(id)}"${progress[id] ? " checked" : ""}>
        <span><strong>Day ${escapeHtml(item.day)}: ${escapeHtml(item.title)}</strong>${escapeHtml(item.task)}</span>
      </label>
    `;
  }).join("");
}

// Main button flow: validate, preview, call /api/coach, then render or show errors.
async function callCoach() {
  const context = buildContext();
  if (!context.studentQuestion) {
    responseOutput.className = "empty-state error";
    responseOutput.textContent = "Type a study question before calling /api/coach.";
    return;
  }
  if (/\b(my name is|student name|school name|marks?|phone|email|address)\b/i.test(context.studentQuestion)) {
    responseOutput.className = "empty-state error";
    responseOutput.textContent = "Remove personal data before calling /api/coach.";
    return;
  }

  previewContext();
  lastContext = context;
  lastResponse = null;
  setCoachStatus("Calling", "working");
  coachButton.disabled = true;
  responseOutput.className = "empty-state";
  responseOutput.textContent = "Sending safe context to /api/coach...";

  try {
    const result = await askStudyCoach(context);
    lastResponse = result;
    setCoachStatus("Ready", "success");
    renderResponse(result);
  } catch (error) {
    setCoachStatus("Error", "danger");
    responseOutput.className = "empty-state error";
    responseOutput.textContent = error.message;
  } finally {
    coachButton.disabled = false;
  }
}

// Reuse the previous safe topic context for one follow-up question.
async function callFollowUp() {
  const question = followUpInput.value.trim();
  if (!question) {
    followUpOutput.className = "empty-state error";
    followUpOutput.textContent = "Type a follow-up question first.";
    return;
  }
  if (!lastContext) {
    followUpOutput.className = "empty-state error";
    followUpOutput.textContent = "Run the study helper first so the follow-up has topic context.";
    return;
  }
  if (/\b(my name is|student name|school name|marks?|phone|email|address)\b/i.test(question)) {
    followUpOutput.className = "empty-state error";
    followUpOutput.textContent = "Remove personal data before calling /api/coach.";
    return;
  }

  const context = { ...lastContext, mode: "follow-up", followUpQuestion: question };
  followUpButton.disabled = true;
  followUpOutput.className = "empty-state";
  followUpOutput.textContent = "Sending follow-up to /api/coach...";

  try {
    const result = await askStudyCoach(context);
    followUpOutput.className = "results";
    followUpOutput.innerHTML = `
      <section class="summary">
        <h3>Coach answer</h3>
        <p>${escapeHtml(result.followUpAnswer || result.topicExplanation || "No follow-up answer returned.")}</p>
      </section>
    `;
  } catch (error) {
    followUpOutput.className = "empty-state error";
    followUpOutput.textContent = error.message;
  } finally {
    followUpButton.disabled = false;
  }
}

// Put the starter back into its first-run state.
function resetApp() {
  studentQuestionInput.value = "";
  followUpInput.value = "";
  lastContext = null;
  lastResponse = null;
  setCoachStatus("Not run");
  responseOutput.className = "empty-state";
  responseOutput.textContent = "Preview the context, then call the shared /api/coach endpoint.";
  followUpOutput.className = "empty-state";
  followUpOutput.textContent = "Run the study helper first, then ask a follow-up.";
  planOutput.className = "empty-state";
  planOutput.textContent = "A returned 7-day plan will appear here.";
  previewContext();
}

// Initial page setup.
renderSelects();
renderTopicCard();
previewContext();

// Event wiring: each listener connects one visible control to one function.
modeSelect.addEventListener("change", previewContext);
gradeSelect.addEventListener("change", previewContext);
learningAreaSelect.addEventListener("change", previewContext);
topicSelect.addEventListener("change", () => {
  renderTopicCard();
  previewContext();
});
studentQuestionInput.addEventListener("input", previewContext);
sampleButton.addEventListener("click", () => {
  studentQuestionInput.value = getTopic().sampleQuestion;
  previewContext();
});
previewButton.addEventListener("click", previewContext);
coachButton.addEventListener("click", callCoach);
resetButton.addEventListener("click", resetApp);
followUpButton.addEventListener("click", callFollowUp);
clearProgressButton.addEventListener("click", () => {
  localStorage.removeItem(progressStorageKey);
  if (lastResponse) {
    renderPlan(lastResponse.sevenDayPlan);
  }
});
planOutput.addEventListener("change", event => {
  const checkbox = event.target.closest("input[data-plan-id]");
  if (!checkbox) {
    return;
  }
  const progress = readProgress();
  progress[checkbox.dataset.planId] = checkbox.checked;
  writeProgress(progress);
});
