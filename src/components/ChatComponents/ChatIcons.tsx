import { SetChainOptions } from "@/aiParams";
import { AI_SENDER, ChatModelDisplayNames } from "@/constants";
import { ChatMessage } from "@/sharedState";
import { getFileContent, getFileName } from "@/utils";
import { Notice, Vault } from "obsidian";
import { useEffect, useState } from "react";

import { ChainType } from "@/chainFactory";
import {
  RefreshIcon,
  SaveAsNoteIcon,
  SendActiveNoteToPromptIcon,
  StopIcon,
  UseActiveNoteAsContextIcon,
} from "@/components/Icons";
import { stringToChainType } from "@/utils";
import React from "react";

interface ChatIconsProps {
  currentModel: string;
  setCurrentModel: (model: string) => void;
  currentChain: ChainType;
  setCurrentChain: (chain: ChainType, options?: SetChainOptions) => void;
  onStopGenerating: () => void;
  onNewChat: () => void;
  onSaveAsNote: () => void;
  onSendActiveNoteToPrompt: () => void;
  onForceRebuildActiveNoteContext: () => void;
  addMessage: (message: ChatMessage) => void;
  vault: Vault;
  removeFrontmatter: boolean;
  
}

const ChatIcons: React.FC<ChatIconsProps> = ({
  currentModel,
  setCurrentModel,
  currentChain,
  setCurrentChain,
  onStopGenerating,
  onNewChat,
  onSaveAsNote,
  onSendActiveNoteToPrompt,
  onForceRebuildActiveNoteContext,
  addMessage,
  vault,
  removeFrontmatter,
}) => {
  const [selectedChain, setSelectedChain] = useState<ChainType>(currentChain);

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentModel(event.target.value);
  };

  const handleChainChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedChain(stringToChainType(event.target.value));
  };

  useEffect(() => {
    const handleRetrievalQAChain = async () => {
      if (selectedChain !== ChainType.RETRIEVAL_QA_CHAIN) {
        setCurrentChain(selectedChain);
        return;
      }

      if (!app) {
        console.error("App instance is not available.");
        return;
      }

      const file = app.workspace.getActiveFile();
      if (!file) {
        new Notice("No active note found.");
        console.error("No active note found.");
        return;
      }
      const noteContent = await getFileContent(file, app, removeFrontmatter);
      const noteName = getFileName(file);

      const activeNoteOnMessage: ChatMessage = {
        sender: AI_SENDER,
        message: `OK Feel free to ask me questions about [[${noteName}]]. \n\nPlease note that this is a retrieval-based QA for notes longer than the model context window. Specific questions are encouraged. For generic questions like 'give me a summary', 'brainstorm based on the content', Chat mode with *Send Note to Prompt* button used with a *long context model* is a more suitable choice. \n\n(A new mode will be added to work on the entire vault next)`,
        isVisible: true,
      };
      addMessage(activeNoteOnMessage);
      if (noteContent) {
        setCurrentChain(selectedChain, { noteContent });
      }
    };

    handleRetrievalQAChain();
  }, [selectedChain]);

  return (
    <div className="chat-icons-container">
      <div className="chat-icon-selection-tooltip">
        <div className="select-wrapper">
          <select
            id="aiModelSelect"
            className="chat-icon-selection"
            value={currentModel}
            onChange={handleModelChange}
          >
            <option value={ChatModelDisplayNames.GPT_35_TURBO}>
              {ChatModelDisplayNames.GPT_35_TURBO}
            </option>
            <option value={ChatModelDisplayNames.GPT_35_TURBO_16K}>
              {ChatModelDisplayNames.GPT_35_TURBO_16K}
            </option>
            <option value={ChatModelDisplayNames.GPT_4}>
              {ChatModelDisplayNames.GPT_4}
            </option>
            <option value={ChatModelDisplayNames.GPT_4_TURBO}>
              {ChatModelDisplayNames.GPT_4_TURBO}
            </option>
            <option value={ChatModelDisplayNames.GPT_4_32K}>
              {ChatModelDisplayNames.GPT_4_32K}
            </option>
            <option value={ChatModelDisplayNames.AZURE_OPENAI}>
              {ChatModelDisplayNames.AZURE_OPENAI}
            </option>
            <option value={ChatModelDisplayNames.GEMINI_PRO}>
              {ChatModelDisplayNames.GEMINI_PRO}
            </option>
            <option value={ChatModelDisplayNames.OPENROUTERAI}>
              {ChatModelDisplayNames.OPENROUTERAI}
            </option>
            <option value={ChatModelDisplayNames.LM_STUDIO}>
              {ChatModelDisplayNames.LM_STUDIO}
            </option>
            <option value={ChatModelDisplayNames.OLLAMA}>
              {ChatModelDisplayNames.OLLAMA}
            </option>
          </select>
          <span className="tooltip-text">Model Selection</span>
        </div>
      </div>
      <button className="chat-icon-button" onClick={onStopGenerating}>
        <StopIcon className="icon-scaler" />
        <span className="tooltip-text">Stop Generating</span>
      </button>
      <button className="chat-icon-button" onClick={onNewChat}>
        <RefreshIcon className="icon-scaler" />
        <span className="tooltip-text">
          New Chat
          <br />
          (unsaved history will be lost)
        </span>
      </button>
      <button className="chat-icon-button" onClick={onSaveAsNote}>
        <SaveAsNoteIcon className="icon-scaler" />
        <span className="tooltip-text">Save as Note</span>
      </button>
      <div className="chat-icon-selection-tooltip">
        <div className="select-wrapper">
          <select
            id="aiChainSelect"
            className="chat-icon-selection"
            value={currentChain}
            onChange={handleChainChange}
          >
            <option value="llm_chain">Chat</option>
            <option value="retrieval_qa">QA</option>
          </select>
          <span className="tooltip-text">Mode Selection</span>
        </div>
      </div>
      {selectedChain === "llm_chain" && (
        <button className="chat-icon-button" onClick={onSendActiveNoteToPrompt}>
          <SendActiveNoteToPromptIcon className="icon-scaler" />
          <span className="tooltip-text">
            Send Note(s) to Prompt
            <br />
            (Set with Copilot command: <br />
            set note context <br />
            in Chat mode.
            <br />
            Default is active note)
          </span>
        </button>
      )}
      {selectedChain === "retrieval_qa" && (
        <button
          className="chat-icon-button"
          onClick={onForceRebuildActiveNoteContext}
        >
          <UseActiveNoteAsContextIcon className="icon-scaler" />
          <span className="tooltip-text">Rebuild Index for Active Note</span>
        </button>
      )}
    </div>
  );
};

export default ChatIcons;
