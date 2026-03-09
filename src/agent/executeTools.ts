import {tools} from './tools/index.ts';
export type ToolName = keyof typeof tools;

export const executeTools = async(toolName: string, args: any) => {
    const tool = tools[toolName as ToolName];

    if (!tool) {
        return `Unknown tool: ${toolName}. This doesn't exist`;
    }

    const execute = tool.execute;

    if (!execute || typeof execute !== 'function') {
        return `Tool ${toolName} does not have an execute function.`;
    }

    const result = await execute(args, {
        toolCallId: '',
        messages: []
    });
    return String(result);
}