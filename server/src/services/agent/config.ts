import BaseTool from "../tools/base";

export interface LastAction {
  toolName: string;
  toolParams: Record<string, any>;
  toolResult: any;
}

export interface AgentConfig<T> {
  tools: { [key: string]: BaseTool };
  promptTemplate: (
    objective: string,
    memory: T,
    availableTools: string,
    lastAction: LastAction | null
  ) => string;
  initialMemory: T;
  updateMemory: (toolName: string, toolResult: any, memory: T) => T;
  isDone: (memory: T) => boolean;
}
