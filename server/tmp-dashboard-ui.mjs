import "dotenv/config";
import { spawn } from "node:child_process";
import { MongoClient, ObjectId } from "mongodb";

const API = "http://localhost:5000";
const email = `setup-ui-${Date.now()}@example.test`;
const password = `Tmp-${crypto.randomUUID()}-9x`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cookiePairs(response) {
  return (response.headers.getSetCookie?.() ?? []).map((raw) => {
    const [pair, ...attrs] = raw.split(";");
    const idx = pair.indexOf("=");
    return { name: pair.slice(0, idx), value: pair.slice(idx + 1), attrs };
  });
}

async function call(path, options = {}, cookie = "") {
  const headers = {
    "Content-Type": "application/json",
    Origin: "http://localhost:3000",
    Referer: "http://localhost:3000/",
    ...(options.headers || {}),
  };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${API}${path}`, { ...options, headers, redirect: "manual" });
  let body = null;
  try { body = await res.json(); } catch {}
  return { status: res.status, body, cookies: cookiePairs(res) };
}

const dbClient = new MongoClient(process.env.MONGODB_URI);
await dbClient.connect();
const db = dbClient.db(process.env.MONGODB_DATABASE || "studiospace");
let userDoc = null;
let bookingId = null;
let studioId = null;
let chrome = null;

try {
  const signup = await call("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({ name: "Setup UI User", email, password }),
  });
  console.log("temp user signup:", signup.status);
  const cookie = signup.cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  userDoc = await db.collection("users").findOne({ email });

  const studios = await call("/api/studios", { method: "GET" });
  const studio = studios.body.studios.find(
    (s) => String(s.hostId) !== String(userDoc._id) && (s.booking?.minimumHours ?? 1) <= 2 && s.capacity >= 1
  );
  studioId = studio._id;
  await call(`/api/wishlist/${studioId}`, { method: "POST", body: "{}" }, cookie);

  const start = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
  start.setUTCHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const booking = await call("/api/bookings", {
    method: "POST",
    body: JSON.stringify({ studioId, startAt: start.toISOString(), endAt: end.toISOString(), guestCount: 1 }),
  }, cookie);
  bookingId = booking.body?.booking?.id;
  console.log("temp wishlist + booking prepared:", Boolean(studioId), booking.status);

  const port = 9225;
  const profile = "C:\\Users\\ASUS\\AppData\\Local\\Temp\\opencode\\chrome-cdp-dashboard";
  chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
    "--remote-allow-origins=*", `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: "ignore" });

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      target = list.find((t) => t.type === "page");
    } catch {}
    if (!target) await sleep(250);
  }
  if (!target) throw new Error("Chrome target unavailable");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 1;
  const pending = new Map();
  const listeners = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
    } else if (m.method) {
      for (const fn of listeners.get(m.method) || []) fn(m.params);
      listeners.delete(m.method);
    }
  };
  const send = (method, params = {}) => {
    const n = id++;
    ws.send(JSON.stringify({ id: n, method, params }));
    return new Promise((resolve, reject) => pending.set(n, { resolve, reject }));
  };
  const once = (method, ms = 15000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout " + method)), ms);
    listeners.set(method, [...(listeners.get(method) || []), (p) => { clearTimeout(timer); resolve(p); }]);
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  for (const c of signup.cookies) {
    await send("Network.setCookie", { name: c.name, value: c.value, url: "http://localhost:3000/" });
  }

  async function visit(path, waitFor = "", timeoutMs = 15000) {
    const loaded = once("Page.loadEventFired").catch(() => null);
    await send("Page.navigate", { url: `http://localhost:3000${path}` });
    await loaded;
    const started = Date.now();
    let last = null;
    while (Date.now() - started < timeoutMs) {
      await sleep(500);
      const r = await send("Runtime.evaluate", {
        expression: `JSON.stringify({path:location.pathname,text:document.body.innerText,headings:[...document.querySelectorAll('h1,h2')].map(e=>e.innerText).slice(0,8)})`,
        returnByValue: true,
      });
      last = JSON.parse(r.result.value);
      if (last.text.includes(waitFor)) break;
    }
    return last;
  }

  const overview = await visit("/dashboard", "Welcome back");
  console.log("dashboard:", overview.path, "welcome:", overview.text.includes("Welcome back"), "stats:", overview.text.includes("Upcoming Bookings"), "headings:", JSON.stringify(overview.headings));

  const bookings = await visit("/dashboard/bookings", studio.title);
  console.log("bookings page:", bookings.path, "booking visible:", bookings.text.includes(studio.title), "title:", bookings.text.includes("My Bookings"), "empty state:", /no (upcoming )?bookings/i.test(bookings.text), "headings:", JSON.stringify(bookings.headings));

  const saved = await visit("/dashboard/saved", studio.title);
  console.log("saved page:", saved.path, "studio visible:", saved.text.includes(studio.title));

  const profilePage = await visit("/dashboard/profile", "Apply to Become a Studio Owner");
  console.log("profile page:", profilePage.path, "apply CTA:", profilePage.text.includes("Apply to Become a Studio Owner"), "email shown:", profilePage.text.includes(email));

  ws.close();
} finally {
  if (chrome) chrome.kill();
  if (userDoc?._id) {
    if (bookingId && /^[0-9a-fA-F]{24}$/.test(bookingId)) {
      await db.collection("bookings").deleteOne({ _id: new ObjectId(bookingId) });
    }
    await db.collection("bookings").deleteMany({ renterId: userDoc._id });
    await db.collection("saved_studios").deleteMany({ userId: userDoc._id });
    await db.collection("host_applications").deleteMany({ userId: userDoc._id });
    await db.collection("sessions").deleteMany({ userId: userDoc._id });
    await db.collection("accounts").deleteMany({ userId: userDoc._id });
    await db.collection("users").deleteOne({ _id: userDoc._id });
  }
  console.log("cleanup: remaining temp UI users =", await db.collection("users").countDocuments({ email }));
  await dbClient.close();
}
