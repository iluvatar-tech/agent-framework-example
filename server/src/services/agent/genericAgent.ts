import { completion } from "litellm";
import { AgentConfig, LastAction } from "./config";
import BaseTool from "../tools/base";

export class GenericAgent<T> {
  private memory: T;
  private actionsTaken: number = 0;
  private tools: { [key: string]: BaseTool };
  private config: AgentConfig<T>;
  private lastAction: LastAction | null = null;

  constructor(config: AgentConfig<T>) {
    this.config = config;
    this.tools = config.tools;
    this.memory = config.initialMemory;
  }

  public async run(objective: string): Promise<T> {
    console.log(`Agent started with objective: "${objective}"`);

    const MAX_ACTIONS = 5;

    while (this.actionsTaken < MAX_ACTIONS) {
      this.actionsTaken++;
      console.log(`--- Action ${this.actionsTaken} ---`);

      if (this.config.isDone(this.memory)) {
        console.log("Objective achieved. Exiting loop.");
        break;
      }

      const availableTools = Object.keys(this.tools)
        .map((key) => {
          const tool = this.tools[key];
          const schema = (tool as any).getParameterSchema() || {};
          return `${key}: ${tool.description} Parameters: ${JSON.stringify(
            schema
          )}\n`;
        })
        .join("\n");

      const prompt = this.config.promptTemplate(
        objective,
        this.memory,
        availableTools,
        this.lastAction
      );
      console.log("Agent's internal prompt:\n", prompt);

      let toolToUse: string | null = null;
      let toolParams: Record<string, any> = {};

      try {
        const response = await completion({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.7,
          apiKey: process.env.OPENAI_API_KEY,
        });

        const rawLLMresponseContent = response.choices[0].message.content;
        console.log("LLM Raw Response:", rawLLMresponseContent);

        if (!rawLLMresponseContent) {
          console.error("LLM response is empty or undefined.");
          break;
        }
        let llmResponseContent = rawLLMresponseContent.replace(/```json/, "").replace(/```/, "").trim();
        const parsedResponse = JSON.parse(llmResponseContent || "{}");
        toolToUse = parsedResponse.tool;
        toolParams = parsedResponse.params || {};
      } catch (error: any) {
        console.error("Error calling LLM or parsing response:", error.message);
        break;
      }

      if (toolToUse && this.tools[toolToUse]) {
        console.log(
          `Agent decided to use tool: ${toolToUse} with params:`,
          toolParams
        );
        try {
          const toolResult = await this.tools[toolToUse].execute(toolParams);
          console.log(`Tool ${toolToUse} executed. Result:`, toolResult);
          this.memory = this.config.updateMemory(toolToUse, toolResult, this.memory);
          this.lastAction = {
            toolName: toolToUse,
            toolParams: toolParams,
            toolResult: toolResult,
          };
        } catch (error: any) {
          console.error(`Error executing tool ${toolToUse}:`, error.message);
          this.lastAction = {
            toolName: toolToUse,
            toolParams: toolParams,
            toolResult: `Error: ${error.message}`,
          };
        }
      } else {
        console.log("Agent could not determine a tool to use.");
        this.lastAction = {
          toolName: "unknown",
          toolParams: {},
          toolResult: "Agent could not determine a tool to use. This should never happen.",
        };
        break;
      }
    }

    console.log("Agent finished. Final Memory:", this.memory);
    console.log("Total actions taken:", this.actionsTaken);
    return this.memory;
  }
}
