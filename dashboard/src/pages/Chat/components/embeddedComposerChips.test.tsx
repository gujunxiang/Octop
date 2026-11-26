import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { OctopUser } from "../../../api/modules/auth";
import type { KnowledgeBase } from "../../../api/modules/knowledgeBases";
import { CurrentUserProvider } from "../../../hooks/useCurrentUser";
import ChatInputPreviewBar from "./ChatInputPreviewBar";
import UserMessageComposerTags from "./UserMessageComposerTags";

const connectors = [
  { mcp_server_name: "coe-web", label: "COE Web", kind: "custom" },
];
const knowledgeBases = [
  {
    id: "coe",
    owner_user_id: 1,
    name: "COE KB",
    description: "",
    default_open: false,
    shared: true,
    icon_name: "book",
    embedding_model: "",
    embedding_dim: 0,
    doc_count: 0,
    max_documents: 1,
    created_at: 0,
    updated_at: 0,
  },
] as KnowledgeBase[];

function asRole(role: "user" | "admin", children: ReactNode) {
  return (
    <CurrentUserProvider
      user={{ id: 7, username: "u", role } as OctopUser}
      setUser={() => undefined}
    >
      {children}
    </CurrentUserProvider>
  );
}

const previewBar = (
  <ChatInputPreviewBar
    attachments={[
      { url: "/files/report.pdf", filename: "report.pdf", kind: "file" },
    ]}
    uploading={false}
    selectedConnectors={["coe-web"]}
    selectedKnowledgeBaseIds={["coe"]}
    availableConnectors={connectors}
    availableKnowledgeBases={knowledgeBases}
    selectedModel="bedrock/claude-sonnet"
    onRemoveAttachment={() => undefined}
    onConnectorsChange={() => undefined}
    onKnowledgeBaseIdsChange={() => undefined}
    onModelChange={() => undefined}
  />
);

const sentTags = (
  <UserMessageComposerTags
    context={{
      skills: ["triage"],
      connectors: ["coe-web"],
      knowledgeBaseIds: ["coe"],
      model: "bedrock/claude-sonnet",
    }}
    lookups={{ connectors, knowledgeBases }}
  />
);

describe("composer chips in Embedded Octop", () => {
  beforeEach(() => sessionStorage.setItem("octop:embed", "1"));
  afterEach(() => sessionStorage.removeItem("octop:embed"));

  it("hides preset chips above the input from a regular user but keeps attachments", () => {
    render(asRole("user", previewBar));

    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.queryByText("COE Web")).not.toBeInTheDocument();
    expect(screen.queryByText("COE KB")).not.toBeInTheDocument();
    expect(screen.queryByText(/claude-sonnet/)).not.toBeInTheDocument();
  });

  it("hides preset tags on sent messages from a regular user but keeps skills", () => {
    render(asRole("user", sentTags));

    expect(screen.getByText(/triage/)).toBeInTheDocument();
    expect(screen.queryByText("COE Web")).not.toBeInTheDocument();
    expect(screen.queryByText("COE KB")).not.toBeInTheDocument();
    expect(screen.queryByText(/claude-sonnet/)).not.toBeInTheDocument();
  });

  it("shows every chip to an Octop admin", () => {
    render(
      asRole(
        "admin",
        <>
          {previewBar}
          {sentTags}
        </>,
      ),
    );

    expect(screen.getAllByText("COE Web")).toHaveLength(2);
    expect(screen.getAllByText("COE KB")).toHaveLength(2);
  });

  it("shows every chip when Octop is opened directly", () => {
    sessionStorage.removeItem("octop:embed");
    render(asRole("user", previewBar));

    expect(screen.getByText("COE Web")).toBeInTheDocument();
    expect(screen.getByText("COE KB")).toBeInTheDocument();
  });
});
