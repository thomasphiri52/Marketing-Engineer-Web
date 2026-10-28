const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');

menu?.addEventListener('click', () => nav.classList.toggle('open'));

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

const pricing = {
  starter: {name:"Starter Programme", upfront:30000, monthly:10000},
  medium: {name:"Medium Programme", upfront:60000, monthly:18000},
  large: {name:"Large Programme", upfront:90000, monthly:25000}
};

function money(value) {
  return "R" + value.toLocaleString("en-ZA");
}

function buildProposal() {
  const selected = document.querySelector('input[name="package"]:checked')?.value || "starter";
  const p = pricing[selected];
  const services = [...document.querySelectorAll('.service-options input:checked')].map(x => x.value);
  const name = document.getElementById("clientName").value.trim();
  const company = document.getElementById("companyName").value.trim();
  const email = document.getElementById("clientEmail").value.trim();

  document.getElementById("summaryPackage").textContent = p.name;
  document.getElementById("summaryFirstMonth").textContent = money(p.upfront + p.monthly);
  document.getElementById("summaryUpfront").textContent = money(p.upfront);
  document.getElementById("summaryMonthly").textContent = money(p.monthly);
  document.getElementById("summaryTotal").textContent = money(p.upfront + p.monthly * 12);
  document.getElementById("summaryServices").innerHTML = services.length
    ? "<strong>Services</strong><br>" + services.join(" · ")
    : "No services selected yet.";
  document.getElementById("summaryClient").textContent =
    name || company || email
      ? `Prepared for ${name || "Prospective Client"}${company ? " · " + company : ""}${email ? " · " + email : ""}.`
      : "Complete your details to personalise the proposal.";
}

async function copyProposal() {
  const text = [
    "THOMAS PHIRI — MARKETING ENGINEER",
    document.getElementById("summaryPackage").textContent,
    "First-month investment: " + document.getElementById("summaryFirstMonth").textContent,
    "Upfront: " + document.getElementById("summaryUpfront").textContent,
    "Monthly: " + document.getElementById("summaryMonthly").textContent,
    "12-month programme: " + document.getElementById("summaryTotal").textContent,
    document.getElementById("summaryServices").innerText,
    document.getElementById("summaryClient").innerText
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    alert("Proposal summary copied.");
  } catch(e) {
    alert(text);
  }
}

// V2 ROI estimator
const roiEls = {
  leads: document.getElementById('leads'), conv: document.getElementById('conv'), value: document.getElementById('value'), lift: document.getElementById('lift'),
  leadsOut: document.getElementById('leadsOut'), convOut: document.getElementById('convOut'), valueOut: document.getElementById('valueOut'), liftOut: document.getElementById('liftOut'),
  roiValue: document.getElementById('roiValue'), currentRevenue: document.getElementById('currentRevenue'), modelRevenue: document.getElementById('modelRevenue'), annualOpportunity: document.getElementById('annualOpportunity')
};
function updateROI(){
  if(!roiEls.leads) return;
  const leads=+roiEls.leads.value, conv=+roiEls.conv.value/100, value=+roiEls.value.value, lift=+roiEls.lift.value/100;
  const current=leads*conv*value, model=leads*Math.min(conv*(1+lift),1)*value, extra=model-current;
  roiEls.leadsOut.textContent=leads.toLocaleString('en-ZA'); roiEls.convOut.textContent=(conv*100).toFixed(1).replace('.0','')+'%';
  roiEls.valueOut.textContent=money(value); roiEls.liftOut.textContent=(lift*100).toFixed(0)+'%';
  roiEls.currentRevenue.textContent=money(current); roiEls.modelRevenue.textContent=money(model); roiEls.roiValue.textContent=money(extra); roiEls.annualOpportunity.textContent=money(extra*12);
}
['leads','conv','value','lift'].forEach(id=>document.getElementById(id)?.addEventListener('input',updateROI)); updateROI();

// V6: persist assessment leads to Supabase when configured; otherwise use email fallback.
document.getElementById('leadForm')?.addEventListener('submit', async e=>{
  e.preventDefault();
  const name=document.getElementById('leadName').value.trim(), company=document.getElementById('leadCompany').value.trim(), email=document.getElementById('leadEmail').value.trim();
  const industry=document.getElementById('leadIndustry').value, need=document.getElementById('leadNeed').value, challenge=document.getElementById('leadChallenge').value.trim();
  const status=document.getElementById('leadStatus');
  const payload={name,company,email,industry,need,challenge};
  const cfg=window.SUPABASE_CONFIG||{};
  if(window.supabase && cfg.url && cfg.anonKey){
    try {
      const client=window.supabase.createClient(cfg.url,cfg.anonKey);
      const {error}=await client.from('leads').insert(payload);
      if(error) throw error;
      status.textContent='Thank you — your assessment has been submitted securely.';
      try{localStorage.removeItem('tp_marketing_engineer_assessment_draft');}catch(_){}
      return;
    } catch(err) {
      console.error('Supabase lead submission failed:',err);
      status.textContent='Online submission failed. Your email app will open so you can send the assessment instead.';
    }
  } else {
    status.textContent='Backend not configured yet. Your email app will open to send the assessment.';
  }
  const subject=encodeURIComponent('Business Assessment Request — '+company);
  const body=encodeURIComponent(`Name: ${name}\nCompany: ${company}\nBusiness email: ${email}\nIndustry: ${industry || 'Not specified'}\nPrimary need: ${need || 'Not specified'}\n\nChallenge:\n${challenge}`);
  window.location.href=`mailto:hello@thomasphiri.co.za?subject=${subject}&body=${body}`;
});

// V3: print-ready proposal. Visitors can choose "Save as PDF" in the browser print dialog.
function printProposal(){
  buildProposal();
  window.print();
}

// V3: business readiness score based on the assessment form.
function calculateReadiness(){
  const industry=document.getElementById('leadIndustry')?.value;
  const need=document.getElementById('leadNeed')?.value;
  const challenge=(document.getElementById('leadChallenge')?.value||'').trim();
  const name=(document.getElementById('leadName')?.value||'').trim();
  const company=(document.getElementById('leadCompany')?.value||'').trim();
  const email=(document.getElementById('leadEmail')?.value||'').trim();
  let score=0;
  if(name) score+=10; if(company) score+=10; if(email) score+=10;
  if(industry) score+=15; if(need) score+=20; if(challenge.length>=30) score+=25; else if(challenge.length>=10) score+=15;
  score=Math.min(score,100);
  const number=document.getElementById('readinessScore'); const label=document.getElementById('readinessLabel'); const bar=document.getElementById('scoreBar');
  if(number) number.textContent=score+'%'; if(bar) bar.style.width=score+'%';
  if(label) label.textContent=score>=80?'Strong project readiness — a discovery conversation can be highly focused.':score>=50?'Good starting point — add more business detail for a stronger brief.':'Early-stage brief — complete the assessment fields to improve the score.';
  return score;
}
['leadName','leadCompany','leadEmail','leadIndustry','leadNeed','leadChallenge'].forEach(id=>document.getElementById(id)?.addEventListener('input',calculateReadiness));

// V3: save a non-sensitive draft locally so a visitor can return to the proposal journey.
function saveAssessmentDraft(){
  const ids=['leadName','leadCompany','leadEmail','leadIndustry','leadNeed','leadChallenge'];
  const draft={savedAt:new Date().toISOString()};
  ids.forEach(id=>{const el=document.getElementById(id); if(el) draft[id]=el.value;});
  try{localStorage.setItem('tp_marketing_engineer_assessment_draft',JSON.stringify(draft));}catch(e){}
}
function loadAssessmentDraft(){
  try{
    const draft=JSON.parse(localStorage.getItem('tp_marketing_engineer_assessment_draft')||'null'); if(!draft)return;
    ['leadName','leadCompany','leadEmail','leadIndustry','leadNeed','leadChallenge'].forEach(id=>{const el=document.getElementById(id); if(el&&draft[id])el.value=draft[id];});
    calculateReadiness();
  }catch(e){}
}
['leadName','leadCompany','leadEmail','leadIndustry','leadNeed','leadChallenge'].forEach(id=>document.getElementById(id)?.addEventListener('change',saveAssessmentDraft));
loadAssessmentDraft();

// V4 — Demo client workspace login
function loginWorkspace(){
  const email=(document.getElementById('workspaceEmail')?.value||'').trim();
  const code=(document.getElementById('workspaceCode')?.value||'').trim();
  const status=document.getElementById('workspaceStatus');
  if(!email || code!=='TP2026'){ if(status) status.textContent='Enter a business email and the demo code TP2026.'; return; }
  localStorage.setItem('tp_workspace_session',JSON.stringify({email,loginAt:new Date().toISOString()}));
  showWorkspace(email);
}
function showWorkspace(email){
  const login=document.getElementById('workspaceLogin'), app=document.getElementById('workspaceApp');
  if(login) login.hidden=true; if(app) app.hidden=false;
  const client=document.getElementById('workspaceClient'); if(client) client.textContent=(email||'Client')+' · Business Workspace';
}
function logoutWorkspace(){ localStorage.removeItem('tp_workspace_session'); const login=document.getElementById('workspaceLogin'),app=document.getElementById('workspaceApp'); if(login) login.hidden=false; if(app) app.hidden=true; }
try{ const session=JSON.parse(localStorage.getItem('tp_workspace_session')||'null'); if(session?.email) showWorkspace(session.email); }catch(e){}

document.querySelectorAll('.workspace-tabs button').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.workspace-tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  document.querySelectorAll('.workspace-panel').forEach(panel=>panel.hidden=panel.dataset.panel!==btn.dataset.tab);
}));
function demoDownload(name){ alert(name+' is available in the demo workspace. Connect cloud storage/backend to serve real client documents.'); }

// V4 — Local demo CRM pipeline
function getLeads(){ try{return JSON.parse(localStorage.getItem('tp_demo_leads')||'[]');}catch(e){return [];} }
function saveLeads(leads){ try{localStorage.setItem('tp_demo_leads',JSON.stringify(leads));}catch(e){} renderLeads(); }
function renderLeads(){
  const leads=getLeads(), box=document.getElementById('leadPipeline'), count=document.getElementById('leadCount');
  if(count) count.textContent=`${leads.length} lead${leads.length===1?'':'s'}`;
  if(!box)return;
  if(!leads.length){box.innerHTML='<div class="empty-state">No assessment leads saved yet. Submit the Business Assessment form to create a local demo lead.</div>';return;}
  box.innerHTML=leads.map((l,i)=>`<div class="lead-item"><div><strong>${escapeHtml(l.company)}</strong><br><small>${escapeHtml(l.name)} · ${escapeHtml(l.email)}</small><br><small>${escapeHtml(l.industry||'Industry not specified')} · ${escapeHtml(l.need||'Need not specified')}</small></div><div><span class="lead-stage">NEW</span><br><small>${new Date(l.createdAt).toLocaleDateString('en-ZA')}</small></div></div>`).join('');
}
function escapeHtml(v){return String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function clearLeads(){if(confirm('Clear all local demo leads?')){localStorage.removeItem('tp_demo_leads');renderLeads();}}
renderLeads();

// Extend assessment submission with a local CRM record.
const leadForm=document.getElementById('leadForm');
leadForm?.addEventListener('submit',()=>{
  const lead={name:document.getElementById('leadName')?.value.trim(),company:document.getElementById('leadCompany')?.value.trim(),email:document.getElementById('leadEmail')?.value.trim(),industry:document.getElementById('leadIndustry')?.value,need:document.getElementById('leadNeed')?.value,challenge:document.getElementById('leadChallenge')?.value.trim(),createdAt:new Date().toISOString()};
  const leads=getLeads(); leads.unshift(lead); saveLeads(leads);
});

// V5 — detect whether the site has been connected to Supabase.
document.addEventListener('DOMContentLoaded',()=>{
  const status=document.getElementById('backendStatus');
  const cfg=window.SUPABASE_CONFIG||{};
  if(status && cfg.url && cfg.anonKey && !cfg.url.includes('YOUR-PROJECT')){
    status.textContent='Supabase credentials detected — production connection ready for integration.';
  }
});


// V7: real Supabase Auth client workspace. Requires supabase-config.js to contain the Project URL and anon/public key.
let tpSupabase = null;
let tpAuthMode = 'signin';
function tpConfig(){ return window.SUPABASE_CONFIG || {}; }
function tpSetAuthStatus(message){ const el=document.getElementById('workspaceStatus'); if(el) el.textContent=message; }
function tpSetAuthMode(mode){
  tpAuthMode=mode;
  const heading=document.getElementById('authHeading'), submit=document.getElementById('authSubmit'), toggle=document.getElementById('toggleAuthMode');
  const name=document.getElementById('workspaceName'), company=document.getElementById('workspaceCompany');
  const signup=mode==='signup';
  if(heading) heading.textContent=signup?'Create your client account':'Sign in to your workspace';
  if(submit) submit.textContent=signup?'Create account':'Sign In';
  if(toggle) toggle.textContent=signup?'I already have an account':'Create account';
  if(name) name.hidden=!signup; if(company) company.hidden=!signup;
  const pw=document.getElementById('workspaceCode'); if(pw) pw.autocomplete=signup?'new-password':'current-password';
  tpSetAuthStatus('');
}
function tpEscape(value){ return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function tpShowAuthenticated(user){
  const login=document.getElementById('workspaceLogin'), app=document.getElementById('workspaceApp');
  if(login) login.hidden=true; if(app) app.hidden=false;
  const title=document.getElementById('workspaceClient'); if(title) title.textContent=(user.email||'Client')+' · Business Workspace';
  loadTpClientWorkspace(user).catch(err=>{console.error(err); const box=document.getElementById('workspaceOverview'); if(box) box.textContent='Signed in, but workspace data could not be loaded. Check database schema and RLS policies.';});
}
function tpShowSignedOut(){ const login=document.getElementById('workspaceLogin'),app=document.getElementById('workspaceApp'); if(login) login.hidden=false; if(app) app.hidden=true; }
async function loadTpClientWorkspace(user){
  if(!tpSupabase) return;
  const {data:projects,error}=await tpSupabase.from('projects').select('id,name,status,progress,created_at').eq('client_id',user.id).order('created_at',{ascending:false});
  if(error) throw error;
  const list=document.getElementById('workspaceProjects'), overview=document.getElementById('workspaceOverview'), metrics=document.getElementById('liveWorkspaceMetrics');
  if(list) list.innerHTML=projects.length?projects.map(p=>`<div><b>${tpEscape(p.name)}</b><span class="status-pill">${tpEscape(p.status)}</span><small>${Number(p.progress)||0}% complete</small><div class="progress-bar"><span style="width:${Math.max(0,Math.min(100,Number(p.progress)||0))}%"></span></div></div>`).join(''):'<p>No projects have been assigned to this account yet.</p>';
  const active=projects.filter(p=>!['completed','complete','done'].includes(String(p.status).toLowerCase())).length;
  const completed=projects.length-active;
  if(overview) overview.textContent=projects.length?`You have ${projects.length} project(s). Progress below is based on records assigned to your account.`:'Your account is active. Your project manager can assign projects to this account.';
  if(metrics) metrics.innerHTML=`<div><strong>${projects.length}</strong><span>Projects</span></div><div><strong>${active}</strong><span>In progress</span></div><div><strong>${completed}</strong><span>Completed</span></div><div><strong>Live</strong><span>Account status</span></div>`;
  const profile=await tpSupabase.from('profiles').select('full_name,company').eq('id',user.id).maybeSingle();
  if(profile.error) console.warn('Profile could not be loaded:',profile.error.message);
}
async function tpInitAuth(){
  const cfg=tpConfig(); const status=document.getElementById('backendStatus');
  if(!window.supabase || !cfg.url || !cfg.anonKey){ if(status) status.textContent='Not connected — configure supabase-config.js with your Supabase Project URL and anon/public key.'; tpSetAuthStatus('Supabase is not configured yet. Add the project URL and anon/public key, then reload.'); return; }
  tpSupabase=window.supabase.createClient(cfg.url,cfg.anonKey);
  if(status) status.textContent='Supabase credentials loaded. Auth is available; database access depends on your schema and RLS policies.';
  document.getElementById('authForm')?.addEventListener('submit',async e=>{
    e.preventDefault(); const email=document.getElementById('workspaceEmail').value.trim(); const password=document.getElementById('workspaceCode').value; const name=document.getElementById('workspaceName').value.trim(); const company=document.getElementById('workspaceCompany').value.trim();
    const button=document.getElementById('authSubmit'); if(button) button.disabled=true; tpSetAuthStatus(tpAuthMode==='signup'?'Creating account…':'Signing in…');
    try{
      if(tpAuthMode==='signup'){
        const {data,error}=await tpSupabase.auth.signUp({email,password,options:{data:{full_name:name,company}}}); if(error) throw error;
        if(data.user && data.session){ const {error:profileError}=await tpSupabase.from('profiles').upsert({id:data.user.id,full_name:name,company},{onConflict:'id'}); if(profileError) console.warn('Profile save issue:',profileError.message); tpShowAuthenticated(data.user); tpSetAuthStatus('Account created.'); }
        else tpSetAuthStatus('Registration submitted. Check your email to confirm the account, then sign in.');
      } else { const {data,error}=await tpSupabase.auth.signInWithPassword({email,password}); if(error) throw error; tpShowAuthenticated(data.user); tpSetAuthStatus('Signed in successfully.'); }
    }catch(err){tpSetAuthStatus(err.message||'Authentication failed. Check your details and Supabase settings.');}
    finally{if(button) button.disabled=false;}
  });
  document.getElementById('toggleAuthMode')?.addEventListener('click',()=>tpSetAuthMode(tpAuthMode==='signin'?'signup':'signin'));
  document.getElementById('resetPassword')?.addEventListener('click',async()=>{const email=document.getElementById('workspaceEmail').value.trim(); if(!email){tpSetAuthStatus('Enter your email address first, then choose Forgot password.');return;} try{const {error}=await tpSupabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname+'#workspace'});if(error)throw error;tpSetAuthStatus('If an account exists for that email, a password-reset message will be sent.');}catch(err){tpSetAuthStatus(err.message||'Password reset could not be started.');}});
  document.querySelector('#workspaceApp .workspace-head button')?.addEventListener('click',async()=>{const {error}=await tpSupabase.auth.signOut();if(error){tpSetAuthStatus(error.message);return;}tpShowSignedOut();tpSetAuthStatus('You have signed out.');});
  const {data:{session},error}=await tpSupabase.auth.getSession(); if(error) console.warn(error.message); if(session?.user) tpShowAuthenticated(session.user); else tpShowSignedOut();
  tpSupabase.auth.onAuthStateChange((_event,session)=>{if(session?.user) tpShowAuthenticated(session.user); else tpShowSignedOut();});
}
document.addEventListener('DOMContentLoaded',()=>{tpSetAuthMode('signin');tpInitAuth();});
