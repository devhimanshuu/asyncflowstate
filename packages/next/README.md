# @asyncflowstate/next

Next.js optimized integration for **AsyncFlowState**. Handle SSR, Server Actions, and App Router transitions with declarative loading, error, and success states.

## Installation

```bash
pnpm add @asyncflowstate/next @asyncflowstate/react @asyncflowstate/core
# or
npm install @asyncflowstate/next @asyncflowstate/react @asyncflowstate/core
```

## Features

- **Server Action Support**: Seamlessly wrap Next.js Server Actions with `useServerActionFlow`.
- **SSR Friendly**: Built-in handling for hydration and server-side state.
- **App Router Integrated**: Works perfectly with `useTransition` and Next.js navigation.

## Basic Usage

### Using with Server Actions

```tsx
'use client';

import { useServerActionFlow } from '@asyncflowstate/next';
import { updateUserProfile } from './actions';

export function ProfileForm() {
  const { execute, loading, error, success } = useServerActionFlow(updateUserProfile, {
    onSuccess: (data) => {
      console.log('Profile updated!', data);
    }
  });

  return (
    <form action={execute}>
      <input name="name" placeholder="Name" />
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
      {error && <p className="error">{error.message}</p>}
      {success && <p className="success">Saved!</p>}
    </form>
  );
}
```

## License

MIT
