import { GenericAgent } from './genericAgent';
import { AgentConfig } from './config';

import FeedFetcher from "../tools/feedFetcher";
import AudioGrabber from "../tools/audioGrabber";
import SummarizerAnalyst from "../tools/summarizerAnalyst";

export interface PodcastAgentMemory {
  podcastName?: string;
  podcastDescription?: string;
  transcript?: string;
  audioURL?: string;
  finalAnswer?: string;
}

export const podcastAgentConfig: AgentConfig<PodcastAgentMemory> = {
  tools: {
    feedFetcher: new FeedFetcher({}),
    audioGrabber: new AudioGrabber({}),
    summarizerAnalyst: new SummarizerAnalyst({}),
  },
  initialMemory: {},
  promptTemplate: (objective, memory, availableTools) => `
    You are a podcast agent designed to help users find and fetch podcast information. Currently, you 
    have the ability to find the latest episodes of a podcast show by its name, get the transcription, and
    answer questions about the podcast.
    Objective: ${objective}
    Current Memory: ${JSON.stringify(memory)}
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
      reasoning: "I need to use this tool because it will help me achieve the objective."
    }
    STRICLY respond with this JSON format only, without any additional text or surrounding formatting.
  `,
  updateMemory: (toolName, toolResult, memory) => {
    if (toolName === "feedFetcher" && toolResult) {
      return {
        ...memory,
        podcastName: toolResult.title,
        podcastDescription: toolResult.description,
        audioURL: toolResult.latestEpisode.audioUrl,
      };
    } else if (toolName === "audioGrabber" && toolResult) {
      return { ...memory, transcript: toolResult };
    } else if (toolName === "summarizerAnalyst" && toolResult) {
      return { ...memory, finalAnswer: toolResult };
    }
    return memory;
  },
  isDone: (memory) => {
    return memory.finalAnswer !== undefined;
  },
  maxActions: 5,
};

export class PodcastAgent {
  private agent: GenericAgent<PodcastAgentMemory>;

  constructor() {
    this.agent = new GenericAgent<PodcastAgentMemory>(podcastAgentConfig);
  }

  public async run(objective: string): Promise<string | undefined> {
    const finalMemory = await this.agent.run(objective);
    return finalMemory.finalAnswer;
  }
}
