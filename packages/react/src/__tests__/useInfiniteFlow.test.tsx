import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useInfiniteFlow } from "./useInfiniteFlow";
import "@testing-library/jest-dom";

describe("useInfiniteFlow", () => {
    it("should fetch pages and manage pagination state", async () => {
        const action = vi.fn().mockImplementation(async (pageParam: number) => {
            return `Page ${pageParam}`;
        });

        const getNextPageParam = vi.fn((lastPage, allPages) => {
            if (allPages.length < 3) {
                return allPages.length + 1;
            }
            return null;
        });

        function TestComponent() {
            const {
                pages,
                fetchNextPage,
                hasNextPage,
                isFetchingNextPage
            } = useInfiniteFlow(action, {
                getNextPageParam,
                initialPageParam: 1,
            });

            return (
                <div>
                    <div data-testid="pages">{pages.join(", ")}</div>
                    <div data-testid="has-next">{String(hasNextPage)}</div>
                    <div data-testid="fetching">{String(isFetchingNextPage)}</div>
                    <button onClick={() => fetchNextPage()} data-testid="fetch-btn">
                        Load More
                    </button>
                </div>
            );
        }

        render(<TestComponent />);

        // Initial state
        expect(screen.getByTestId("pages")).toHaveTextContent("");
        expect(screen.getByTestId("has-next")).toHaveTextContent("true");
        expect(screen.getByTestId("fetching")).toHaveTextContent("false");

        // Fetch page 1 (manual trigger usually required if not in useEffect)
        fireEvent.click(screen.getByTestId("fetch-btn"));

        expect(screen.getByTestId("fetching")).toHaveTextContent("true");

        await waitFor(() => {
            expect(screen.getByTestId("pages")).toHaveTextContent("Page 1");
        });
        expect(screen.getByTestId("fetching")).toHaveTextContent("false");
        expect(screen.getByTestId("has-next")).toHaveTextContent("true");

        // Fetch page 2
        fireEvent.click(screen.getByTestId("fetch-btn"));
        await waitFor(() => {
            expect(screen.getByTestId("pages")).toHaveTextContent("Page 1, Page 2");
        });

        // Fetch page 3
        fireEvent.click(screen.getByTestId("fetch-btn"));
        await waitFor(() => {
            expect(screen.getByTestId("pages")).toHaveTextContent("Page 1, Page 2, Page 3");
            expect(screen.getByTestId("has-next")).toHaveTextContent("false");
        });

        // Try to fetch again (should do nothing)
        fireEvent.click(screen.getByTestId("fetch-btn"));
        expect(action).toHaveBeenCalledTimes(3);
    });
});
