import BaseTool from "./base";

/**
 * SummarizerAnalyst Tool: Produces a summary, chapter list, key quotes, and sentiment.
 * This tool is intended to be the final step, providing the agent's final answer to the user.
 */
export default class SummarizerAnalyst extends BaseTool {
  constructor(config: any) {
    super(config);
    this.name = "summarizerAnalyst";
    this.description = "Answer the user's question. This is the final tool to be called by the agent when the answer is ready.";
  }

  /**
   * Get the parameter schema for the SummarizerAnalyst tool.
   * It takes a single parameter: "finalAnswer".
   * @returns The parameter schema.
   */
  getParameterSchema(): Record<string, any> {
    return {
      type: "object",
      properties: {
        finalAnswer: {
          type: "string",
          description: "The complete and final answer to be presented to the user.",
        },
      },
      required: ["finalAnswer"],
    };
  }

  /**
   * Execute the SummarizerAnalyst tool.
   * In this context, it simply returns the provided finalAnswer.
=   * @param params - Parameters for the tool execution, expecting 'finalAnswer'.
   * @returns The final answer.
   */
  async execute(params: Record<string, any> = {}): Promise<any> {
    const { finalAnswer } = params;
    if (!finalAnswer) {
      throw new Error("Missing 'finalAnswer' parameter for SummarizerAnalyst tool.");
    }
    // In a real scenario, an LLM call would happen here to generate the summary
    // For now, we just return the provided finalAnswer as per the task description.
    console.log("Summarizer/Analyst producing final answer:", finalAnswer);
    return finalAnswer;
  }
}
