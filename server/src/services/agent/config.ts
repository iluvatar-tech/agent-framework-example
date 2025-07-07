import BaseTool from "../tools/base";

export interface AgentConfig<T> {
  tools: { [key: string]: BaseTool };
  promptTemplate: (objective: string, memory: T, availableTools: string) => string;
  initialMemory: T;
  updateMemory: (toolName: string, toolResult: any, memory: T) => T;
  isDone: (memory: T) => boolean;
  maxActions: number;
}

