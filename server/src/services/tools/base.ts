/**
 * Base Tool class that defines the interface for all tools
 */

export interface ToolMetadata {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export default class BaseTool {
  protected config: any;
  public name: string;
  public description: string;

  /**
   * Create a new tool
   * @param config - Configuration for the tool
   */
  constructor(config: any) {
    this.config = config;
    this.name = this.constructor.name;
    this.description = 'Base tool';
  }

  /**
   * Initialize the tool with the given configuration
   */
  async initialize(): Promise<void> {
    // Base implementation does nothing, subclasses can override
  }

  /**
   * Execute the tool with the given parameters
   * @param params - Parameters for the tool execution
   * @returns The result of the tool execution
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async execute(params: Record<string, any> = {}): Promise<any> {
    throw new Error('Method execute() must be implemented by subclass');
  }

  /**
   * Get the tool's metadata
   * @returns The tool's metadata
   */
  getMetadata(): ToolMetadata {
    return {
      name: this.name,
      description: this.description,
      parameters: this.getParameterSchema(),
    };
  }

  /**
   * Get the parameter schema for the tool
   * @returns The parameter schema
   */
  getParameterSchema(): Record<string, any> {
    return {};
  }
}
