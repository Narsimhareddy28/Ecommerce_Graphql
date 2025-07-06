import fs from 'fs';
import path from 'path';

class GraphVisualizer {
  constructor(agent) {
    this.agent = agent;
    this.nodes = this.extractNodes();
    this.edges = this.extractEdges();
  }

  // Extract nodes from our agent
  extractNodes() {
    return {
      'START': { name: 'START', type: 'start' },
      'classifyIntent': { 
        name: 'Intent Classification', 
        type: 'process',
        description: 'AI analyzes user message and determines intent'
      },
      'searchProducts': { 
        name: 'Product Search', 
        type: 'process',
        description: 'Search database for matching products'
      },
      'browseCategories': { 
        name: 'Browse Categories', 
        type: 'process',
        description: 'Load categories and sample products'
      },
      'compareProducts': { 
        name: 'Product Comparison', 
        type: 'process',
        description: 'AI generates detailed product comparison'
      },
      'generateProductResponse': { 
        name: 'Product Response', 
        type: 'process',
        description: 'AI generates product information response'
      },
      'generateCategoryResponse': { 
        name: 'Category Response', 
        type: 'process',
        description: 'Format category information response'
      },
      'generateGeneralResponse': { 
        name: 'General Response', 
        type: 'process',
        description: 'Handle general queries and greetings'
      },
      'END': { name: 'END', type: 'end' }
    };
  }

  // Extract edges (connections) from our agent logic
  extractEdges() {
    return [
      // From START
      { source: 'START', target: 'classifyIntent', label: '' },
      
      // From classifyIntent (conditional routing)
      { source: 'classifyIntent', target: 'searchProducts', label: 'PRODUCT_SEARCH\\nPRODUCT_COMPARE', conditional: true },
      { source: 'classifyIntent', target: 'browseCategories', label: 'CATEGORY_BROWSE', conditional: true },
      { source: 'classifyIntent', target: 'generateGeneralResponse', label: 'GREETING\\nGENERAL_HELP', conditional: true },
      
      // From searchProducts (conditional routing)
      { source: 'searchProducts', target: 'compareProducts', label: 'intent=COMPARE\\n& multiple products', conditional: true },
      { source: 'searchProducts', target: 'generateProductResponse', label: 'otherwise', conditional: true },
      
      // From browseCategories
      { source: 'browseCategories', target: 'generateCategoryResponse', label: '' },
      
      // To END
      { source: 'compareProducts', target: 'END', label: '' },
      { source: 'generateProductResponse', target: 'END', label: '' },
      { source: 'generateCategoryResponse', target: 'END', label: '' },
      { source: 'generateGeneralResponse', target: 'END', label: '' }
    ];
  }

  // Generate Mermaid diagram syntax
  generateMermaidSyntax() {
    let mermaid = 'graph TD\n';
    
    // Add nodes
    Object.entries(this.nodes).forEach(([id, node]) => {
      const nodeIcon = this.getNodeIcon(node.type);
      const nodeShape = this.getNodeShape(node.type);
      const label = `${nodeIcon} ${node.name}`;
      
      if (node.description) {
        mermaid += `    ${id}${nodeShape.start}"${label}<br/><small>${node.description}</small>"${nodeShape.end}\n`;
      } else {
        mermaid += `    ${id}${nodeShape.start}"${label}"${nodeShape.end}\n`;
      }
    });
    
    mermaid += '\n';
    
    // Add edges
    this.edges.forEach(edge => {
      const arrow = edge.conditional ? '-.->' : '-->';
      const edgeLabel = edge.label ? `|"${edge.label}"| ` : ' ';
      mermaid += `    ${edge.source} ${arrow}${edgeLabel}${edge.target}\n`;
    });
    
    mermaid += '\n';
    
    // Add styling
    mermaid += this.generateStyling();
    
    return mermaid;
  }

  // Get icon for different node types
  getNodeIcon(type) {
    const icons = {
      'start': '🚀',
      'end': '🏁',
      'process': '⚙️'
    };
    return icons[type] || '⚙️';
  }

  // Get shape for different node types
  getNodeShape(type) {
    const shapes = {
      'start': { start: '([', end: '])' },
      'end': { start: '([', end: '])' },
      'process': { start: '[', end: ']' }
    };
    return shapes[type] || { start: '[', end: ']' };
  }

  // Generate CSS styling for the diagram
  generateStyling() {
    return `
    %% Styling
    classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    classDef process fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    class START,END startEnd
    class classifyIntent,searchProducts,browseCategories,compareProducts,generateProductResponse,generateCategoryResponse,generateGeneralResponse process
`;
  }

  // Generate state flow diagram
  generateStateFlowSyntax() {
    return `
graph TD
    START([🚀 User Message]) --> A["🧠 classifyIntent<br/>---<br/>Input: userMessage<br/>Process: AI analysis<br/>Output: intent"]
    
    A --> B{🚦 Route by Intent}
    
    B -->|PRODUCT_SEARCH<br/>PRODUCT_COMPARE| C["🔍 searchProducts<br/>---<br/>Input: userMessage<br/>Process: Database query<br/>Output: searchResults[]"]
    B -->|CATEGORY_BROWSE| D["📂 browseCategories<br/>---<br/>Input: userMessage<br/>Process: Load categories<br/>Output: categories[]"]
    B -->|GREETING<br/>GENERAL_HELP| E["💬 generateGeneralResponse<br/>---<br/>Input: userMessage<br/>Process: AI response<br/>Output: response"]
    
    C --> F{🚦 Route by Results}
    
    F -->|intent=COMPARE<br/>& multiple products| G["⚖️ compareProducts<br/>---<br/>Input: searchResults[]<br/>Process: AI comparison<br/>Output: response"]
    F -->|otherwise| H["📝 generateProductResponse<br/>---<br/>Input: searchResults[]<br/>Process: AI description<br/>Output: response"]
    
    D --> I["🏷️ generateCategoryResponse<br/>---<br/>Input: categories[]<br/>Process: Format response<br/>Output: response"]
    
    G --> END([🏁 Final Response])
    H --> END
    I --> END
    E --> END
    
    %% State object
    J["📊 State Object<br/>---<br/>userMessage: string<br/>intent: string<br/>searchResults: Product[]<br/>categories: Category[]<br/>response: string<br/>responseType: string<br/>products: Product[]<br/>error: string"]
    
    %% Styling
    classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    classDef node fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef state fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    
    class START,END startEnd
    class A,C,D,E,G,H,I node
    class B,F decision
    class J state
`;
  }

  // Save diagrams to files
  async saveDiagrams() {
    const outputDir = path.join(process.cwd(), 'graph-visualizations');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate and save basic graph
    const basicGraph = this.generateMermaidSyntax();
    fs.writeFileSync(path.join(outputDir, 'langgraph-structure.mmd'), basicGraph);
    
    // Generate and save state flow
    const stateFlow = this.generateStateFlowSyntax();
    fs.writeFileSync(path.join(outputDir, 'langgraph-state-flow.mmd'), stateFlow);
    
    // Generate HTML files for viewing
    const htmlTemplate = (title, mermaidCode) => `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
</head>
<body>
    <h1>${title}</h1>
    <div class="mermaid">
${mermaidCode}
    </div>
    <script>
        mermaid.initialize({startOnLoad:true});
    </script>
</body>
</html>`;

    fs.writeFileSync(
      path.join(outputDir, 'langgraph-structure.html'), 
      htmlTemplate('LangGraph Structure', basicGraph)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'langgraph-state-flow.html'), 
      htmlTemplate('LangGraph State Flow', stateFlow)
    );

    console.log('📊 Graph visualizations saved to:', outputDir);
    console.log('📁 Files created:');
    console.log('  - langgraph-structure.mmd (Mermaid source)');
    console.log('  - langgraph-structure.html (Viewable in browser)');
    console.log('  - langgraph-state-flow.mmd (State flow source)');
    console.log('  - langgraph-state-flow.html (State flow viewable in browser)');
    console.log('🌐 Open the .html files in your browser to view the diagrams!');
    
    return {
      basicGraph,
      stateFlow,
      outputDir
    };
  }

  // Console output method (like Python's display)
  displayGraph() {
    console.log('\n🎨 LANGGRAPH STRUCTURE:');
    console.log('========================');
    console.log(this.generateMermaidSyntax());
    
    console.log('\n🔄 STATE FLOW:');
    console.log('===============');
    console.log(this.generateStateFlowSyntax());
    
    return this.generateMermaidSyntax();
  }

  // Get graph info (like Python's get_graph())
  getGraph() {
    return {
      nodes: this.nodes,
      edges: this.edges,
      mermaidSyntax: this.generateMermaidSyntax(),
      stateFlowSyntax: this.generateStateFlowSyntax(),
      
      // Methods similar to Python
      draw_mermaid: () => this.generateMermaidSyntax(),
      draw_state_flow: () => this.generateStateFlowSyntax(),
      save_diagrams: () => this.saveDiagrams(),
      display: () => this.displayGraph()
    };
  }
}

export default GraphVisualizer; 