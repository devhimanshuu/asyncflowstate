'use client';

import React from 'react';
import { useServerActionFlow } from '@asyncflowstate/next';

/**
 * Mock Server Action
 */
async function updateUserProfile(formData: FormData) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const name = formData.get('name') as string;

    if (name.length < 3) {
        throw new Error('Name must be at least 3 characters long');
    }

    return { id: 1, name, updated: true };
}

/**
 * Example 1: Basic Server Action Integration
 * Shows how to bind a server action to a form with automatic loading and error states.
 */
export function ServerActionForm() {
    const { execute, isLoading: loading, error, isSuccess, data } = useServerActionFlow(updateUserProfile, {
        onSuccess: (result: { name: string; id: number }) => {
            console.log(`Profile updated for ${result.name}!`);
        },
        onError: (err: Error) => {
            console.error(err.message);
        }
    });

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold">Update Profile</h2>

            <form action={(fd) => { execute(fd); }} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        name="name"
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Enter your name"
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded text-white ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>

            {isSuccess && (
                <div className="text-green-600 text-sm">
                    Successfully updated! Server returned ID: {data?.id}
                </div>
            )}

            {error && (
                <div className="text-red-600 text-sm">
                    Error: {error.message}
                </div>
            )}
        </div>
    );
}

/**
 * Example 2: Optimistic UI with Server Actions
 * Demonstrates updating the UI instantly while the server action processes.
 */
export function OptimisticLikeButton({ initialLikes }: { initialLikes: number }) {
    const [likes, setLikes] = React.useState(initialLikes);

    const { execute, loading } = useServerActionFlow(
        async (postId: string) => {
            // Simulate API call
            await new Promise(r => setTimeout(r, 2000));
            return { success: true };
        },
        {
            onStart: () => {
                // Optimistic update
                setLikes(prev => prev + 1);
            },
            onError: () => {
                // Rollback on error
                setLikes(prev => prev - 1);
                console.error("Failed to like post");
            }
        }
    );

    return (
        <button
            onClick={() => execute("post-123")}
            className={`flex items-center space-x-2 p-2 rounded ${loading ? 'text-pink-400' : 'text-gray-600 hover:text-pink-600'
                }`}
        >
            <span>❤️</span>
            <span>{likes} Likes</span>
            {loading && <span className="text-xs animate-pulse">(syncing...)</span>}
        </button>
    );
}
