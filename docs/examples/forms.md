# Form Handling Examples



Comprehensive form patterns with AsyncFlowState.

## Basic Form Submission

<RealWorldPattern type="form" class="my-8" />

```tsx
function ContactForm() {
  const flow = useFlow(async (data) => {
    return await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json());
  });

  return (
    <form {...flow.form({ extractFormData: true })}>
      <input name="name" placeholder="Your Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />

      <button type="submit" disabled={flow.loading}>
        {flow.loading ? 'Sending...' : 'Send Message'}
      </button>

      {flow.success && <p className="success"><i class="fa-solid fa-circle-check mr-2"></i> Message sent!</p>}
      {flow.error && <p className="error">{flow.error.message}</p>}
    </form>
  );
}
```

## Zod Validation

<RealWorldPattern type="form-validation" class="my-8" />

```tsx
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(
  (d) => d.password === d.confirmPassword,
  { message: "Passwords don't match", path: ["confirmPassword"] }
);

function RegistrationForm() {
  const flow = useFlow(api.register, {
    onSuccess: () => router.push('/dashboard'),
  });

  return (
    <form {...flow.form({ schema: registerSchema, extractFormData: true })}>
      <div>
        <label>Username</label>
        <input name="username" />
        {flow.fieldErrors.username && (
          <span className="error">{flow.fieldErrors.username}</span>
        )}
      </div>

      <div>
        <label>Email</label>
        <input name="email" type="email" />
        {flow.fieldErrors.email && (
          <span className="error">{flow.fieldErrors.email}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input name="password" type="password" />
        {flow.fieldErrors.password && (
          <span className="error">{flow.fieldErrors.password}</span>
        )}
      </div>

      <div>
        <label>Confirm Password</label>
        <input name="confirmPassword" type="password" />
        {flow.fieldErrors.confirmPassword && (
          <span className="error">{flow.fieldErrors.confirmPassword}</span>
        )}
      </div>

      <button type="submit" disabled={flow.loading}>
        {flow.loading ? 'Creating Account...' : 'Sign Up'}
      </button>

      {flow.error && (
        <div ref={flow.errorRef} role="alert" className="form-error">
          {flow.error.message}
        </div>
      )}
    </form>
  );
}
```

## Login Form with Error Focus

<RealWorldPattern type="form-login" class="my-8" />

```tsx
function LoginForm() {
  const flow = useFlow(
    async (credentials) => api.login(credentials),
    {
      onSuccess: (user) => {
        setUser(user);
        router.push('/dashboard');
      },
      a11y: {
        announceError: "Login failed. Please check your credentials.",
      },
    }
  );

  return (
    <form {...flow.form({ extractFormData: true })}>
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />

      <button type="submit" disabled={flow.loading}>
        {flow.loading ? 'Signing in...' : 'Sign In'}
      </button>

      {flow.error && (
        <div ref={flow.errorRef} role="alert">
          <strong>Error:</strong> {flow.error.message}
        </div>
      )}
    </form>
  );
}
```

## Dynamic Multi-Field Forms

<RealWorldPattern type="form-settings" class="my-8" />

```tsx
function SettingsForm({ settings }) {
  const flow = useFlow(api.updateSettings, {
    autoReset: { enabled: true, delay: 3000 },
    onSuccess: () => toast.success("Settings updated"),
  });

  return (
    <form {...flow.form({ extractFormData: true })}>
      {settings.map((setting) => (
        <div key={setting.key}>
          <label>{setting.label}</label>
          <input
            name={setting.key}
            defaultValue={setting.value}
            type={setting.type}
          />
        </div>
      ))}

      <button type="submit" disabled={flow.loading}>
        {flow.loading ? "Updating..." : flow.success ? <><i class="fa-solid fa-circle-check mr-2"></i> Updated!</> : "Save Settings"}
      </button>
    </form>
  );
}
```

## Resilient Auto-save

Perfect for document editors or profile settings where you want to save in the background as the user types without constant UI interruptions.

<RealWorldPattern type="auto-save" class="my-8" />

```tsx
function ProfileEditor() {
  const flow = useFlow(api.updateProfile, {
    debounce: 1000,         // Wait for 1s of inactivity
    concurrency: "restart", // New edits cancel pending saves
    loading: { delay: 500 } // Don't show "Saving..." for quick edits
  });

  return (
    <div>
      <input 
        onChange={(e) => flow.execute({ bio: e.target.value })} 
        placeholder="Tell us about yourself..."
      />
      
      <div className="status-indicator">
        {flow.loading && <span><i class="fa-solid fa-cloud-arrow-up mr-2"></i> Saving...</span>}
        {flow.success && <span><i class="fa-solid fa-circle-check mr-2"></i> All changes saved</span>}
        {flow.error && <span className="error">Save failed. We'll try again.</span>}
      </div>
    </div>
  );
}
```

---

## Multi-step Enrollment Wizard

Manage complex, multi-page forms as a single logical unit using `useFlowSequence`.

<RealWorldPattern type="wizard" class="my-8" />

```tsx
function EnrollmentWizard() {
  const sequence = useFlowSequence([
    { name: "Account Details", flow: useFlow(api.checkAvailability) },
    { name: "Plan Selection", flow: useFlow(api.calculateQuote) },
    { name: "Finalize", flow: useFlow(api.completeEnrollment) },
  ]);

  return (
    <div className="wizard">
      <header>
        Step {sequence.currentStep + 1}: {sequence.steps[sequence.currentStep].name}
      </header>

      <div className="step-content">
        {/* Render different step components based on sequence.currentStep */}
      </div>

      <div className="actions">
        <button 
          onClick={() => sequence.execute(formData)}
          disabled={sequence.loading}
        >
          {sequence.loading ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
```
