---
layout: doc
title: Meet the Creator
---

<div class="creator-container">
<div class="creator-header">
<div class="creator-avatar-wrapper">
<img src="https://github.com/devhimanshuu.png" alt="Himanshu" class="creator-avatar" />
<div class="avatar-glow"></div>
</div>
<h1 class="creator-name">Himanshu Gupta</h1>
<p class="creator-title">Creator of <span class="brand-text">AsyncFlowState</span></p>

<div class="creator-links">
<a href="https://github.com/devhimanshuu" target="_blank" class="social-icon github" aria-label="GitHub">
<i class="fa-brands fa-github"></i>
</a>
<a href="https://linkedin.com/in/himanshu-guptaa" target="_blank" class="social-icon linkedin" aria-label="LinkedIn">
<i class="fa-brands fa-linkedin"></i>
</a>
<a href="https://twitter.com/devhimanshuu" target="_blank" class="social-icon twitter" aria-label="X">
<i class="fa-brands fa-x-twitter"></i>
</a>
<a href="https://himanshuguptaa.vercel.app" target="_blank" class="social-icon portfolio" aria-label="Portfolio">
<i class="fa-solid fa-globe"></i>
</a>
<a href="mailto:devhimanshuu@gmail.com" class="social-icon email" aria-label="Email">
<i class="fa-solid fa-envelope"></i>
</a>
</div>

<div class="creator-badges">
<span class="badge">Open Source Contributor</span>
<span class="badge">Full Stack AI Developer</span>
<span class="badge">Maintainer of AsyncFlowState</span>
</div>

<div class="creator-actions">
<a href="mailto:devhimanshuu@gmail.com" class="cta-button hire-me">
<i class="fa-solid fa-paper-plane"></i>
<span>Hire Me</span>
</a>
<a href="https://github.com/sponsors/devhimanshuu" target="_blank" class="cta-button sponsor">
<i class="fa-solid fa-heart"></i>
<span>Sponsor</span>
</a>
</div>
</div>

<div class="creator-bio">
<p>
I am a <span class="highlight">Full Stack AI Developer</span> and <span class="highlight">lead maintainer</span> of <span class="brand-text">AsyncFlowState</span>. My mission is to bridge the gap between complex asynchronous logic and premium user experiences. I believe that every interaction should feel predictable, resilient, and alive.
</p>
</div>

<div class="creator-quote">
<blockquote>
"The best async state is the one the user never has to think about."
</blockquote>
</div>
</div>

<style scoped>
.creator-container {
margin: 2rem 0;
padding: 40px;
background: var(--vp-c-bg-soft);
border-radius: 24px;
border: 1px solid var(--vp-c-divider);
text-align: center;
box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.creator-header {
margin-bottom: 40px;
}

.creator-avatar-wrapper {
position: relative;
display: inline-block;
margin-bottom: 24px;
}

.creator-avatar {
width: 160px;
height: 160px;
border-radius: 50%;
border: 4px solid var(--vp-c-brand-1);
position: relative;
z-index: 2;
transition: transform 0.3s ease;
}

.avatar-glow {
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 180px;
height: 180px;
background: radial-gradient(circle, var(--vp-c-brand-1) 0%, transparent 70%);
opacity: 0.3;
filter: blur(20px);
z-index: 1;
}

.creator-avatar-wrapper:hover .creator-avatar {
transform: scale(1.05);
}

.creator-name {
font-size: 3rem;
font-weight: 900;
margin: 0;
background: linear-gradient(135deg, var(--vp-c-text-1) 0%, var(--vp-c-brand-1) 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
letter-spacing: -0.02em;
}

.creator-title {
font-size: 1.25rem;
color: var(--vp-c-text-2);
margin-top: 8px;
font-weight: 500;
}

.brand-text {
font-weight: 800;
background: linear-gradient(135deg, var(--afs-brand) 0%, var(--afs-accent) 100%);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
display: inline-block;
letter-spacing: -0.02em;
}

.highlight {
font-weight: 700;
color: var(--vp-c-text-1);
background: linear-gradient(120deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%);
padding: 2px 6px;
border-radius: 4px;
border-bottom: 2px solid var(--vp-c-brand-soft);
}

.creator-badges {
display: flex;
flex-wrap: wrap;
justify-content: center;
gap: 8px;
margin-top: 16px;
}

.badge {
padding: 4px 10px;
background: var(--vp-c-brand-soft);
color: var(--vp-c-brand-1);
border: 1px solid rgba(99, 102, 241, 0.2);
border-radius: 6px;
font-size: 0.75rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.05em;
white-space: nowrap;
}

.creator-actions {
display: flex;
justify-content: center;
gap: 20px;
margin-top: 40px;
}

.cta-button {
position: relative;
display: flex;
align-items: center;
gap: 12px;
padding: 14px 32px;
border-radius: 16px;
font-weight: 900;
font-size: 1rem;
text-decoration: none !important;
transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
overflow: hidden;
}

/* --- Premium Hire Me (Pulsing Gradient) --- */
.hire-me {
background: linear-gradient(135deg, var(--afs-brand) 0%, var(--afs-brand-dark) 100%);
color: white !important;
box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.5);
border: 1px solid rgba(255, 255, 255, 0.1);
}

.hire-me::before {
content: '';
position: absolute;
top: 0;
left: -100%;
width: 100%;
height: 100%;
background: linear-gradient(
  90deg,
  transparent,
  rgba(255, 255, 255, 0.2),
  transparent
);
transition: 0.5s;
}

.hire-me:hover::before {
left: 100%;
}

.hire-me:hover {
transform: translateY(-5px) scale(1.02);
box-shadow: 0 20px 40px -12px rgba(99, 102, 241, 0.6);
}

/* --- Premium Sponsor (Glassmorphism) --- */
.sponsor {
background: rgba(var(--vp-c-bg-soft-rgb), 0.5);
backdrop-filter: blur(10px);
border: 1px solid var(--vp-c-divider);
color: var(--vp-c-text-1);
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.sponsor i {
color: #ea4aaa;
filter: drop-shadow(0 0 5px rgba(234, 74, 170, 0.3));
}

.sponsor:hover {
transform: translateY(-5px) scale(1.02);
border-color: #ea4aaa;
background: rgba(234, 74, 170, 0.08);
box-shadow: 0 15px 30px -10px rgba(234, 74, 170, 0.2);
}

.sponsor:hover i {
animation: heartBeat 1.2s infinite;
}

@keyframes heartBeat {
0% { transform: scale(1); }
14% { transform: scale(1.3); }
28% { transform: scale(1); }
42% { transform: scale(1.3); }
70% { transform: scale(1); }
}

.creator-bio {
font-size: 1.15rem;
line-height: 1.6;
color: var(--vp-c-text-2);
margin-bottom: 40px;
max-width: 600px;
margin-left: auto;
margin-right: auto;
}

.creator-links {
display: flex;
justify-content: center;
gap: 24px;
margin-top: 16px;
margin-bottom: 24px;
}

.social-icon {
font-size: 1.5rem;
color: var(--vp-c-text-2);
text-decoration: none !important;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
display: flex;
align-items: center;
justify-content: center;
width: 40px;
height: 40px;
border-radius: 50%;
background: transparent;
}

.social-icon:hover {
color: var(--vp-c-brand-1);
transform: translateY(-4px) scale(1.1);
background: var(--vp-c-brand-soft);
}

.creator-quote {
border-top: 1px solid var(--vp-c-divider);
padding-top: 40px;
}

.creator-quote blockquote {
font-style: italic;
font-size: 1.5rem;
color: var(--vp-c-text-2);
border: none;
margin: 0;
padding: 0;
}

@media (max-width: 640px) {
.creator-container {
padding: 20px;
}
.creator-name {
font-size: 2rem;
}
.creator-links {
gap: 16px;
}
.social-icon {
font-size: 1.25rem;
}
.creator-actions {
flex-direction: column;
gap: 12px;
}
.cta-button {
justify-content: center;
}
}
</style>
