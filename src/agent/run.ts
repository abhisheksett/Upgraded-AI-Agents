import 'dotenv/config'
import {generateText, tool, type ModelMessage} from 'ai'
import {openai} from '@ai-sdk/openai'
import { SYSTEM_PROMPT } from './system/prompt'
import type { AgentCallbacks } from '../types'
import {tools} from './tools/index.ts';
import {executeTools} from './executeTools.ts';
import {getTracer, Laminar} from '@lmnr-ai/lmnr'

const MODEL_NAME = 'gpt-4o-mini'

Laminar.initialize({
    projectApiKey: process.env.LAMINAR_API_KEY || '',
})

export const runAgent = async(
    userMessage: string,
    conversationHistory: ModelMessage[],
    callbacks: AgentCallbacks
) => {
    const {text, toolCalls } = await generateText({
        model: openai(MODEL_NAME),
        system: SYSTEM_PROMPT,
        prompt: userMessage,
        tools,
        experimental_telemetry: {
            isEnabled: true,
            tracer: getTracer()
        }
    })

    console.log(text, toolCalls)

    toolCalls.forEach(async(toolCall) => {
        const {toolName, input: args} = toolCall;
        const result = await executeTools(toolName, args)
        console.log(result)
    })

    await Laminar.flush()
}

runAgent(`What's the current time right now?`)

