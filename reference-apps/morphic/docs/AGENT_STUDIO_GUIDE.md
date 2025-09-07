# Agent Studio User Guide

## Overview

The Agent Studio is a sophisticated visual workflow editor for designing, monitoring, and tweaking AI agent orchestrations within the Morphic template. It provides an intuitive drag-and-drop interface for creating complex agent workflows with real-time execution monitoring and data flow visualization.

## 🚀 Quick Start

### Accessing Agent Studio
Navigate to `/studio` in your Morphic application to access the Agent Studio.

### Basic Workflow
1. **Start fresh** by clicking the "🆕 New" button to clear the canvas
2. **Drag nodes** from the left palette onto the canvas
3. **Connect nodes** by dragging from output handles to input handles
4. **Configure nodes** by clicking them and editing properties in the right panel
5. **Execute workflow** by clicking the "▶️ Run" button
6. **Monitor execution** in real-time with status updates and data flow visualization
7. **Save your work** using the "💾 Save" button for future use

## 🎯 Core Features

### Component Creation System 🏗️
**NEW!** Create custom agents, tools, panels, logics, and workflows that become available in your main Morphic application:

#### Creating Custom Components
1. **Design Workflow**: Build your workflow visually using drag-and-drop
2. **Save as Template**: Click "Save" in Template Library to create reusable component
3. **Configure Metadata**: Add name, description, category, and tags
4. **Use in Main App**: Your custom component appears automatically in the main application

#### Component Types You Can Create
- **🤖 Custom Agents**: Combine multiple tools and logic into new agent types
- **🔧 Composite Tools**: Chain multiple tools together for complex operations
- **🎨 Dynamic Panels**: Create custom UI layouts and data displays
- **🔀 Advanced Logic**: Build complex decision trees and data flows
- **📊 Complete Workflows**: Full automation pipelines for specific tasks

### Visual Workflow Canvas
- **Infinite Canvas**: Pan and zoom with mouse/touch gestures
- **Grid System**: Snap-to-grid for precise node placement
- **Mini-map**: Navigate large workflows easily
- **Keyboard Shortcuts**: Standard editing shortcuts (Ctrl+Z, Delete, etc.)
- **Floating Toolbar**: Quick access to Save, Run, Debug, and New buttons

### Node System

#### Agent Nodes 🤖
- **Researcher Agent**: Full-featured agent with search, retrieval, shopping, and video tools
- **Manual Researcher**: Simplified agent for direct knowledge queries
- **Generate Related Questions**: AI-powered question generation from research prompts
- **Configuration**: Model selection, temperature, max steps, tool selection

#### Tool Nodes 🔧
- **Search Tool**: Web search with configurable depth and domains
- **Retrieve Tool**: Content extraction from specific URLs
- **Shopping Tool**: Product search across retailers
- **Video Search Tool**: Video content discovery
- **Question Tool**: AI-powered question generation and processing
- **Configuration**: Provider settings, retry logic, performance metrics

#### Data Nodes 📊
- **Input Data**: Define workflow input parameters
- **Output Data**: Capture and display results
- **Variable**: Store intermediate data
- **Configuration**: Data types, validation rules, default values

#### Logic Nodes 🔀
- **Condition**: If/else branching logic
- **Loop**: Iterative processing
- **Transformer**: Data manipulation and formatting
- **Configuration**: Custom logic expressions and functions

#### UI Nodes 🎨
- **Panel Generator**: Create dynamic UI panels
- **Notification**: User feedback and alerts
- **Configuration**: Templates and styling options

## 🎛️ Toolbar Controls

### Floating Toolbar Buttons
The Agent Studio features a convenient floating toolbar with four essential buttons:

#### 🆕 New Button
- **Function**: Clears the entire canvas and resets to a blank state
- **Use Case**: Start fresh workflows or remove all current work
- **Effect**: Removes all nodes, edges, and execution history
- **Shortcut**: Click to instantly get a clean canvas

#### 💾 Save Button
- **Function**: Save current workflow as a reusable template
- **Use Case**: Preserve complex workflows for future use
- **Effect**: Opens template creation dialog with metadata options
- **Integration**: Saved templates appear in main app component library

#### ▶️ Run Button
- **Function**: Execute the current workflow with real-time monitoring
- **Use Case**: Test and run your visual AI workflows
- **Effect**: Triggers execution engine with live status updates
- **Features**: Shows progress, data flow, and execution results

#### 🐛 Debug Button
- **Function**: Activate debugging mode for workflow inspection
- **Use Case**: Step through execution and troubleshoot issues
- **Effect**: Opens execution monitor with detailed debugging tools
- **Features**: Breakpoints, step-through, and performance analysis

## 🔗 Connection System

### Creating Connections
1. Hover over a node's output handle (right side)
2. Drag to another node's input handle (left side)
3. Release to create the connection

### Data Flow Visualization
- **Animated Edges**: Green glowing edges show active data flow
- **Flow Labels**: Display data being passed between nodes
- **Real-time Updates**: See data movement during execution

### Connection Types
- **Direct Flow**: Standard data passing between nodes
- **Conditional Flow**: Branching based on node results
- **Loop Flow**: Iterative data processing

## ⚙️ Node Configuration

### Property Panel
Located on the right side of the interface, the property panel shows:
- **Node-specific settings** based on selected node type
- **Real-time validation** with error feedback
- **Dynamic forms** that adapt to node capabilities

### Common Configuration Options
- **Model Selection**: Choose AI models (GPT-4, Claude, etc.)
- **Temperature**: Control response creativity (0.0-2.0)
- **Max Steps**: Limit agent reasoning steps
- **Retry Logic**: Configure error handling
- **Validation Rules**: Data type and format validation

## 🔄 Using Your Custom Components in the Main Application

### Automatic Component Discovery
Once you save a component in Agent Studio, it becomes immediately available in your main Morphic application:

#### How It Works
1. **Save in Studio**: Create and save your component
2. **Automatic Registration**: Component Registry detects new component
3. **Main App Integration**: Component appears in relevant selection menus
4. **Real-time Sync**: Changes sync across browser tabs instantly

#### Where Your Components Appear
- **🤖 Agent Selection**: Custom agents in agent picker
- **🔧 Tool Library**: Custom tools in tool selection
- **🎨 Panel Types**: Custom panels in UI panel picker
- **📊 Workflow Templates**: Complete workflows in template library

### Component Registry Features
- **Live Updates**: New components appear without app restart
- **Search & Filter**: Find your custom components easily
- **Usage Tracking**: See how often your components are used
- **Version History**: Track changes and improvements

## ▶️ Workflow Execution

### Running Workflows
1. Click the **"Run"** button in the header
2. Watch **real-time execution** with node status updates
3. Monitor **data flow** between connected nodes
4. View **execution results** and timing information

### Execution Monitoring
- **Node Status Indicators**:
  - 🔘 Idle: Ready to execute
  - 🟡 Running: Currently processing
  - 🟢 Completed: Successfully finished
  - 🔴 Error: Execution failed
- **Progress Tracking**: Visual execution flow
- **Performance Metrics**: Execution time and success rates

### Debugging Features
- **Step-through execution** with breakpoints
- **Error inspection** with detailed error messages
- **Execution history** for troubleshooting
- **Node performance analytics**

## 🎨 Advanced Features

### Template System & Component Creation 📚

#### Managing Your Custom Components
The Template Library (rightmost panel) is your component creation and management hub:

##### Saving Workflows as Components
1. **Design Your Workflow**: Create any workflow using drag-and-drop
2. **Click "Save"**: Open the save dialog in Template Library
3. **Configure Component**:
   - **Name**: Descriptive name for your component
   - **Description**: What it does and when to use it
   - **Category**: Research, Shopping, Analysis, Automation, or Custom
   - **Tags**: Keywords for easy searching (comma-separated)
4. **Save**: Your component is now available in the main application!

##### Template Categories
- **🤖 Research**: Research assistants, data analysis, content generation
- **🛒 Shopping**: Price comparison, product research, shopping automation
- **📊 Analysis**: Data processing, report generation, insights
- **⚙️ Automation**: Workflow automation, batch processing, scheduling
- **🎨 Custom**: Specialized workflows for unique use cases

##### Loading & Reusing Components
1. **Browse Templates**: Scroll through your saved components
2. **Search & Filter**: Use search bar and category filters
3. **Click "Load"**: Instantly load any template onto the canvas
4. **Modify & Save**: Create variations of existing components

#### Export/Import System 🌐
Share your creations across instances and team members:

##### Exporting Components
1. **Select Template**: Click on any template in the library
2. **Click Export**: Download as JSON file
3. **Share**: Send to team members or backup

##### Importing Components
1. **Click "Import"**: Open file picker in Template Library
2. **Select JSON File**: Choose exported component file
3. **Import**: Component appears in your library instantly

##### Cross-Platform Compatibility
- Export from development environment
- Import to production environment
- Share with team members
- Backup and restore your component library

### Plugin Architecture
Extend Agent Studio with custom components:
- **Custom Node Types**: Build specialized nodes
- **Integration Modules**: Connect to external services
- **UI Themes**: Customize the visual appearance
- **Export/Import**: Share workflows across instances

### Performance Optimization
- **Lazy Loading**: Load nodes on demand
- **Caching**: Store frequently used results
- **Parallel Execution**: Run independent nodes simultaneously
- **Memory Management**: Efficient resource usage

## 🔧 Technical Architecture

### Core Components
```
Agent Studio/
├── Canvas/           # Main workflow canvas
├── Nodes/            # Node type definitions
├── Edges/            # Connection system
├── Engine/           # Workflow execution
├── Palette/          # Node creation tools
├── Properties/       # Configuration panels
└── Templates/        # Workflow templates
```

### Integration Points
- **Morphic Agents**: Direct integration with existing agent system
- **Tool Library**: Access to all Morphic tools and services
- **UI Framework**: Consistent with Morphic design system
- **State Management**: Real-time synchronization

### API Endpoints
- `/api/search`: Web search functionality
- `/api/agent/run`: Workflow execution
- `/api/panels`: UI panel management
- `/api/shop/search`: Shopping search

## 📊 Analytics & Monitoring

### Workflow Metrics
- **Execution Time**: Total and per-node timing
- **Success Rates**: Node and workflow completion rates
- **Data Transfer**: Volume and type of data flow
- **Error Analysis**: Failure patterns and causes

### Performance Dashboard
- **Real-time Monitoring**: Live execution statistics
- **Historical Analysis**: Past workflow performance
- **Optimization Suggestions**: Performance improvement recommendations
- **Resource Usage**: Memory and CPU utilization

## 🔒 Security & Best Practices

### Data Handling
- **Input Validation**: Comprehensive data type checking
- **Secure Connections**: Encrypted data transmission
- **Access Control**: Role-based permissions
- **Audit Logging**: Complete execution history

### Workflow Design
- **Modular Architecture**: Reusable node components
- **Error Handling**: Graceful failure recovery
- **Version Control**: Workflow versioning and rollback
- **Documentation**: Auto-generated workflow documentation

## 🚀 Component Creation Tutorials

### Tutorial 1: Creating a Custom Research Agent 🤖

#### Step-by-Step Guide
1. **Open Agent Studio**: Navigate to `/studio`

2. **Design the Workflow**:
   - Drag **Researcher Agent** to canvas
   - Add **Search Tool** and connect it
   - Add **Retrieve Tool** for detailed content
   - Add **Data Output** node for results

3. **Configure Each Node**:
   - **Researcher Agent**: Set GPT-4, temperature 0.7, max 5 steps
   - **Search Tool**: Choose Exa provider, set retry count to 3
   - **Retrieve Tool**: Configure for URL extraction
   - **Output**: Set data type to "object"

4. **Test the Workflow**:
   - Click "Run" to test execution
   - Verify data flows correctly
   - Check all nodes complete successfully

5. **Save as Custom Agent**:
   - Click "Save" in Template Library
   - Name: "Advanced Research Assistant"
   - Description: "Comprehensive research with search and content extraction"
   - Category: "Research"
   - Tags: "research, search, analysis, content"

6. **Use in Main App**:
   - Your custom agent now appears in agent selection
   - Select it for research tasks
   - It behaves as a single, reusable component

### Tutorial 2: Building a Shopping Comparison Tool 🛒

#### Create Automated Price Comparison
1. **Design Workflow**:
   - **Input Data** → **Shopping Tool** → **Data Processor** → **Panel Generator**

2. **Configure Components**:
   - Input: Product search query
   - Shopping Tool: Multiple retailer search
   - Data Processor: Price comparison logic
   - Panel: Comparison results display

3. **Save as Template**:
   - Name: "Price Comparison Suite"
   - Category: "Shopping"
   - Tags: "shopping, comparison, prices"

### Tutorial 3: Creating a Report Generation Workflow 📊

#### Automated Report Creation
1. **Workflow Design**:
   - **Data Collection** → **Analysis Agent** → **Report Generator** → **Email Tool**

2. **Component Configuration**:
   - Collect data from multiple sources
   - AI analysis and insights
   - Generate formatted reports
   - Send via email

3. **Save & Deploy**:
   - Template becomes available for scheduled reports
   - Use in main app for automated reporting

## 🔧 Advanced Usage

### Component Registry API
For developers integrating with the component system:

```typescript
import { componentRegistry } from '@/lib/studio/component-registry'

// Get all available workflows
const workflows = componentRegistry.getAllWorkflows()

// Listen for new components
componentRegistry.addListener((type, action, id) => {
  console.log(`New ${type} ${action}d: ${id}`)
})

// Search components
const results = componentRegistry.searchWorkflows('research')
```

### Custom Node Development
```typescript
// Example custom node
export function CustomNode({ data }: NodeProps) {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} />
      <div>Custom Logic</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
```

### Workflow Automation
- **Scheduled Execution**: Time-based workflow triggers
- **Event-driven Workflows**: React to external events
- **API Integration**: RESTful workflow execution
- **Batch Processing**: Handle multiple inputs efficiently

### Collaboration Features
- **Shared Workflows**: Team workflow collaboration
- **Version History**: Track changes and revisions
- **Comments & Notes**: Workflow documentation
- **Export/Import**: Cross-platform compatibility

## 🐛 Troubleshooting

### Common Issues
- **Connection Problems**: Check node compatibility
- **Execution Errors**: Verify configuration settings
- **Performance Issues**: Monitor resource usage
- **UI Glitches**: Clear browser cache and reload

### Debug Mode
- Enable debug logging for detailed execution information
- Use breakpoint nodes for step-through debugging
- Access execution logs for error analysis
- Performance profiling for optimization

## 📚 Resources

### Documentation
- **API Reference**: Complete API documentation
- **Node Library**: Detailed node specifications
- **Integration Guide**: Third-party integration tutorials
- **Best Practices**: Workflow design guidelines

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussion Forums**: Community support and discussions
- **Video Tutorials**: Step-by-step usage guides
- **Example Workflows**: Pre-built workflow templates

## 🎯 Success Metrics

✅ **Intuitive Interface**: Users create workflows without documentation
✅ **Real-time Feedback**: Live execution visualization and monitoring
✅ **Extensible Architecture**: Easy addition of new node types
✅ **High Performance**: Smooth operation with complex workflows
✅ **Integrated Experience**: Seamless Morphic ecosystem integration
✅ **Beautiful Design**: Consistent with Morphic aesthetic

---

**🎉 Agent Studio is now ready for production use!**

The Agent Studio transforms your Morphic template into a powerful visual AI development environment, rivaling commercial tools while maintaining the elegance and sophistication of your existing system.

For questions or support, please refer to the documentation or create an issue in the project repository.