# Node Types & Usage

The Agent Studio supports several types of nodes, each serving a specific purpose in your workflow.

## Agent Nodes

### Researcher Agent
- **Purpose**: Performs comprehensive research on topics
- **Use Case**: When you need in-depth analysis and information gathering
- **Configuration**: Set research depth, sources, and output format

### Manual Researcher Agent
- **Purpose**: Allows manual intervention in research process
- **Use Case**: When you need human oversight in research tasks
- **Configuration**: Define intervention points and approval workflows

### Generate Related Questions Agent
- **Purpose**: Creates follow-up questions based on research findings
- **Use Case**: Building comprehensive knowledge bases or Q&A systems
- **Configuration**: Set question generation parameters and relevance thresholds

## Tool Nodes

### Search Tool
- **Purpose**: Performs web searches using various providers
- **Use Case**: Finding current information and data
- **Configuration**: Choose search provider, set result limits

### Retrieve Tool
- **Purpose**: Fetches specific content from URLs
- **Use Case**: Getting detailed information from known sources
- **Configuration**: Set URL, content type, and extraction rules

### Shopping Tool
- **Purpose**: Searches for products and pricing information
- **Use Case**: E-commerce research and price comparison
- **Configuration**: Set product categories and search parameters

### Video Search Tool
- **Purpose**: Finds and analyzes video content
- **Use Case**: Multimedia research and content discovery
- **Configuration**: Set video platforms and search criteria

### Question Tool
- **Purpose**: Generates AI-powered questions for various contexts
- **Use Case**: Creating quizzes, surveys, or interactive content
- **Configuration**: Define question types and difficulty levels

## Data Nodes

### Data Input
- **Purpose**: Accepts and validates input data
- **Use Case**: Starting workflows with external data
- **Configuration**: Define data schema and validation rules

### Data Output
- **Purpose**: Formats and exports workflow results
- **Use Case**: Saving or sharing workflow outputs
- **Configuration**: Choose output format and destination

## Logic Nodes

### Condition Node
- **Purpose**: Makes decisions based on data conditions
- **Use Case**: Branching workflows based on results
- **Configuration**: Define conditions and branching rules

### Loop Node
- **Purpose**: Repeats operations on data sets
- **Use Case**: Processing multiple items or iterative tasks
- **Configuration**: Set loop conditions and iteration limits

## UI Nodes

### Display Node
- **Purpose**: Shows information to users during execution
- **Use Case**: Providing progress updates or results
- **Configuration**: Choose display format and content

### Input Node
- **Purpose**: Collects user input during workflow execution
- **Use Case**: Interactive workflows requiring user decisions
- **Configuration**: Define input types and validation

## Best Practices

1. **Start Simple**: Begin with basic agent and tool combinations
2. **Use Logic Nodes**: Add decision points for complex workflows
3. **Test Incrementally**: Run and debug small sections before expanding
4. **Document Your Work**: Use comments and clear node naming
5. **Reuse Templates**: Save successful patterns for future use