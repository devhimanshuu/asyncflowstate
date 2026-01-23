/**
 * AsyncFlowState - React Examples
 * 
 * These examples show how to use @asyncflowstate/react in React components.
 */

import React, { useState } from 'react';
import { useFlow } from '@asyncflowstate/react';

// =============================================================================
// Example 1: Login Form
// =============================================================================

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginFlow = useFlow(
    async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      return response.json();
    },
    {
      onSuccess: (user: any) => {
        console.log('Logged in as:', user.name);
        // Redirect or update global state
      },
      onError: (error: any) => {
        console.error('Login failed:', error.message);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginFlow.execute({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      
      <input
        type="email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={loginFlow.loading}
      />
      
      <input
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        placeholder="Password"
        disabled={loginFlow.loading}
      />
      
      {loginFlow.error && (
        <div className="error" ref={loginFlow.errorRef}>
          {(loginFlow.error as Error).message}
        </div>
      )}
      
      {loginFlow.status === 'success' && (
        <div className="success">Welcome back!</div>
      )}
      
      <button {...loginFlow.button()} type="submit">
        {loginFlow.loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// =============================================================================
// Example 2: Like Button with Optimistic UI
// =============================================================================

interface Post {
  id: number;
  title: string;
  likes: number;
  isLiked: boolean;
}

export function LikeButton({ post }: { post: Post }) {
  const likeFlow = useFlow(
    async () => {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      });
      return response.json();
    },
    {
      optimisticResult: {
        ...post,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        isLiked: !post.isLiked,
      },
    }
  );

  const currentPost = likeFlow.data || post;

  return (
    <button
      onClick={() => likeFlow.execute()}
      disabled={likeFlow.loading}
      className={currentPost.isLiked ? 'liked' : ''}
    >
      ❤️ {currentPost.likes}
    </button>
  );
}

// =============================================================================
// Example 3: Delete with Confirmation
// =============================================================================

export function DeleteButton({ itemId }: { itemId: number }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const deleteFlow = useFlow(
    async () => {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      
      return true;
    },
    {
      onSuccess: () => {
        setShowConfirm(false);
        // Trigger refresh or remove from list
      },
    }
  );

  if (deleteFlow.status === 'success') {
    return <span>Deleted ✓</span>;
  }

  if (!showConfirm) {
    return (
      <button onClick={() => setShowConfirm(true)}>
        Delete
      </button>
    );
  }

  return (
    <div className="confirm-dialog">
      <p>Are you sure?</p>
      {deleteFlow.error && (
        <p className="error">{(deleteFlow.error as Error).message}</p>
      )}
      <button
        onClick={() => deleteFlow.execute()}
        disabled={deleteFlow.loading}
      >
        {deleteFlow.loading ? 'Deleting...' : 'Yes, Delete'}
      </button>
      <button onClick={() => setShowConfirm(false)}>
        Cancel
      </button>
    </div>
  );
}

// =============================================================================
// Example 4: Form with Button Helper
// =============================================================================

export function ProfileForm() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const saveFlow = useFlow(
    async (data: { name: string; bio: string }) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    {
      autoReset: { enabled: true, delay: 3000 },
    }
  );

  return (
    <form {...saveFlow.form()}>
      <h2>Edit Profile</h2>
      
      <label>
        Name:
        <input
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
      </label>
      
      <label>
        Bio:
        <textarea
          value={bio}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
        />
      </label>
      
      {saveFlow.error && (
        <div className="error">
          {(saveFlow.error as Error).message}
        </div>
      )}
      
      {saveFlow.status === 'success' && (
        <div className="success">Profile saved!</div>
      )}
      
      <button
        type="button"
        onClick={() => saveFlow.execute({ name, bio })}
        disabled={saveFlow.loading}
      >
        {saveFlow.loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}

// =============================================================================
// Example 5: Search with Debounce
// =============================================================================

export function SearchInput() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const searchFlow = useFlow(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return [];
      
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      return response.json();
    }
  );

  // Simple debounce effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search when debounced query changes
  React.useEffect(() => {
    if (debouncedQuery) {
      searchFlow.execute(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      
      {searchFlow.loading && <span>Searching...</span>}
      
      {searchFlow.data && (
        <ul>
          {(searchFlow.data as any[]).map((item, i) => (
            <li key={i}>{item.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =============================================================================
// Example 6: File Upload with Progress
// =============================================================================

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const uploadFlow = useFlow(
    async (fileToUpload: File) => {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    {
      onSuccess: (result) => {
        console.log('Uploaded:', result);
        setFile(null);
      },
    }
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadFlow.execute(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploadFlow.loading}
      />
      
      {file && (
        <div>
          <p>Selected: {file.name}</p>
          <button onClick={handleUpload} disabled={uploadFlow.loading}>
            {uploadFlow.loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
      
      {uploadFlow.error && (
        <div className="error">
          {(uploadFlow.error as Error).message}
        </div>
      )}
      
      {uploadFlow.status === 'success' && (
        <div className="success">Upload complete!</div>
      )}
    </div>
  );
}

// =============================================================================
// Example 7: Retry with User Control
// =============================================================================

export function DataFetcher({ url }: { url: string }) {
  const fetchFlow = useFlow(
    async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    },
    {
      retry: {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential',
      },
    }
  );

  React.useEffect(() => {
    fetchFlow.execute();
  }, [url]);

  if (fetchFlow.loading) {
    return <div>Loading...</div>;
  }

  if (fetchFlow.error) {
    return (
      <div>
        <p>Error: {(fetchFlow.error as Error).message}</p>
        <button onClick={() => fetchFlow.execute()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <pre>{JSON.stringify(fetchFlow.data, null, 2)}</pre>
  );
}

// =============================================================================
// Example 8: Advanced Form with validation and Accessibility
// =============================================================================

export function AdvancedForm() {
  const saveFlow = useFlow(
    async (data: { title: string; category: string }) => {
      // Simulate task
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Saved:", data);
      return { success: true };
    },
    {
      a11y: {
        announceSuccess: "Document saved successfully!",
        announceError: (err: any) => `Failed: ${err.message}`,
      },
      loading: {
        minDuration: 500, // UX: Ensure loading shows for enough time
      },
    },
  );

  return (
    <div style={{ position: "relative" }}>
      <saveFlow.LiveRegion />

      <form
        {...saveFlow.form({
          extractFormData: true,
          resetOnSuccess: true,
          validate: (data: any) => {
            const errors: Record<string, string> = {};
            if (!data.title) errors.title = "Title is required";
            if (!data.category) errors.category = "Category is required";
            return Object.keys(errors).length > 0 ? errors : null;
          },
        })}
      >
        <h2>Advanced Form</h2>

        <div>
          <label htmlFor="title">Title:</label>
          <input id="title" name="title" />
          {saveFlow.fieldErrors.title && (
            <span className="error">{saveFlow.fieldErrors.title}</span>
          )}
        </div>

        <div>
          <label htmlFor="category">Category:</label>
          <select id="category" name="category">
            <option value="">Select...</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
          </select>
          {saveFlow.fieldErrors.category && (
            <span className="error">{saveFlow.fieldErrors.category}</span>
          )}
        </div>

        {saveFlow.error && (
          <div className="error" ref={saveFlow.errorRef} tabIndex={-1}>
            {(saveFlow.error as Error).message}
          </div>
        )}

        <button {...saveFlow.button()} type="submit">
          {saveFlow.loading ? "Saving..." : "Save Document"}
        </button>
      </form>
    </div>
  );
}

