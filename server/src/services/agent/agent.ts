import BaseTool from "../tools/base";
import FeedFetcher from "../tools/feedFetcher";
import AudioGrabber from "../tools/audioGrabber";
import SummarizerAnalyst from "../tools/summarizerAnalyst";

import { completion } from "litellm";

interface AgentMemory {
  podcastName?: string;
  podcastDescription?: string;
  transcript?: string;
  audioURL?: string;
  finalAnswer?: string;
}

export class Agent {
  private memory: AgentMemory = {};
  private actionsTaken: number = 0;
  private tools: { [key: string]: BaseTool };

  constructor() {
    // Initialize tools here. In a real application, this might be dynamic.
    this.tools = {
      feedFetcher: new FeedFetcher({}),
      audioGrabber: new AudioGrabber({}),
      summarizerAnalyst: new SummarizerAnalyst({}),
    };
  }

  public async run(objective: string): Promise<string | undefined> {
    console.log(`Agent started with objective: "${objective}"`);

    const MAX_ACTIONS = 5; // Limit the number of actions

    while (this.actionsTaken < MAX_ACTIONS) {
      this.actionsTaken++;
      console.log(`--- Action ${this.actionsTaken} ---`);

      // 1. Prompt Construction
      const availableTools = Object.keys(this.tools)
        .map((key) => {
          const tool = this.tools[key];
          const schema = (tool as any).getParameterSchema() || {};
          return `${key}: ${tool.description} Parameters: ${JSON.stringify(
            schema
          )}\n`;
        })
        .join("\n");

      const prompt = `
        You are a podcast agent designed to help users find and fetch podcast information. Currently, you 
        have the ability to find the latest episodes of a podcast show by its name, get the transcription, and
        answer questions about the podcast.
        Objective: ${objective}
        Current Memory: ${JSON.stringify(this.memory)}
        Available Tools:
        ${availableTools}

        Based on the objective and current memory, decide the next action.
        Respond with a JSON object containing "tool" (name of the tool) and "params" (parameters for the tool).
        Example Response:
        {
          "tool": "tool_name",
          "params": {
            "showName": "first_argument_to_tool"
          },
          "reasoning": "I need to use this tool because it will help me achieve the objective."
        }
        STRICLY respond with this JSON format only, without any additional text or surrounding formatting.
      `;
      console.log("Agent's internal prompt:\n", prompt);

      // 2. Action Selection (LLM Call)
      let toolToUse: string | null = null;
      let toolParams: Record<string, any> = {};

      try {
        const response = await completion({
          model: "gpt-4o", 
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
          apiKey: process.env.OPENAI_API_KEY,
        });

        const rawLLMresponseContent = response.choices[0].message.content;
        console.log("LLM Raw Response:", rawLLMresponseContent);

        // Attempt to parse the LLM's response
        if (!rawLLMresponseContent) {
          console.error("LLM response is empty or undefined.");
          break; // Exit loop if LLM response is empty
        }
        // Remove the code block formatting if present
        let llmResponseContent = rawLLMresponseContent.replace(/```json/, "").replace(/```/, "").trim();

        // Parse LLM response as JSON
        const parsedResponse = JSON.parse(llmResponseContent || "{}");

        toolToUse = parsedResponse.tool;
        toolParams = parsedResponse.params || {};
      } catch (error: any) {
        console.error("Error calling LLM or parsing response:", error.message);
        break; // Exit loop on LLM error
      }

     if (toolToUse && this.tools[toolToUse]) {
        console.log(
          `Agent decided to use tool: ${toolToUse} with params:`,
          toolParams
        );
        try {
          // 3. Tool Execution
          const toolResult = await this.tools[toolToUse].execute(toolParams);

          console.log(
            `Tool ${toolToUse} executed. Result:`,
            toolResult
          );

          // 4. State Update
          if (toolToUse === "feedFetcher" && toolResult) {
            this.memory.podcastName = toolResult.title;
            this.memory.podcastDescription = toolResult.description;
            this.memory.audioURL = toolResult.latestEpisode.audioUrl;
            
          } else if (toolToUse === "audioGrabber" && toolResult) {
            this.memory.transcript = toolResult;
          } else if (toolToUse === "summarizerAnalyst" && toolResult) {
            this.memory.finalAnswer = toolResult;
            console.log("Agent has produced the final answer.");
            return this.memory.finalAnswer; // Exit loop after producing final answer
          }
        } catch (error: any) {
          // Append error to memory or handle appropriately
        }
      } else {
        console.log("Agent could not determine a tool to use or objective achieved.");
        break; // Exit loop if no tool is selected
      }

      // 5. Loop Continuation - handled by while condition
    }

    console.log("Agent finished. Final Memory:", this.memory);
    console.log("Total actions taken:", this.actionsTaken);
  }
}