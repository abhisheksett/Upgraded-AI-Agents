import type {
  EvalData,
  SingleTurnResult,
  MultiTurnEvalData,
  MultiTurnResult,
} from "./types.ts";

import { generateText, stepCountIs, tool, type ToolSet } from "ai";
import { openai } from "@ai-sdk/openai";
import {z} from "zod";
import path from "path";
import { buildMessages } from "./utils.ts";
import { da } from "zod/locales";

// Mock the tools
const TOOL_DEFINITIONS = {
  writeFile: {
    description: 'Write contents to a file at a specific path',
    parameters: z.object({
      path: z.string().describe('The path to the file to write'),
      content: z.string().describe('The content to write to the file')
    })
  },
  readFile: {
    description: 'Read the contents of a file at a specific path',
    parameters: z.object({
      path: z.string().describe('The path to the file to read')
    })
  },
  deleteFile: {
    description: 'Delete a file at a specific path',
    parameters: z.object({
      path: z.string().describe('The path to the file to delete')
    })
  },
  listFiles: {
    description: 'List all files in a specific directory',
    parameters: z.object({
      path: z.string().describe('The path to the directory to list files from')
    })
  },
  runCommand: {
    description: 'Execute a shell command and return the output',
    parameters: z.object({
      command: z.string().describe('The shell command to execute')
    })
  }
}

export const singleTurnExecutorWithMocks = async (data: EvalData) => {
  const messages = buildMessages(data);

  const tools: ToolSet = {};
  for (const toolName of data.tools) {
    const def = TOOL_DEFINITIONS[toolName as keyof typeof TOOL_DEFINITIONS];

    if (def) {
      tools[toolName] = tool({
        description: def.description,
        inputSchema: def.parameters,
      })
    }

    const {toolCalls} = await generateText({
      model: openai(data.config?.model || 'gpt-4o-mini'),
      messages,
      tools,
      stopWhen: stepCountIs(1),
      temperature: data.config?.temperature ?? undefined
    })

    const calls = toolCalls.map(tc => ({
      toolName: tc.toolName,
      args: "args" in tc ? tc.args : undefined
    }))

    const toolNames = toolCalls.map(tc => tc.toolName);

    return {
      toolCalls: calls,
      toolNames,
      selectedAny: toolNames.length > 0
    } as SingleTurnResult
  }
}
