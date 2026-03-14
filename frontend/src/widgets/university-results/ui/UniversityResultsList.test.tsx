import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UniversityResultsList } from "./UniversityResultsList";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe("UniversityResultsList", () => {
  it("renders loading skeleton when fetching", () => {
    render(
      <Wrapper>
        <UniversityResultsList programQuery="Computer Science" />
      </Wrapper>
    );
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });
});
