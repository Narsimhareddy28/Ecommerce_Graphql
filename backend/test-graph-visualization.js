import ecommerceAgent from './services/ecommerceAgent.js';

console.log('🎨 LangGraph Visualization Demo');
console.log('================================\n');

// Get the graph structure (like Python's get_graph())
const graph = ecommerceAgent.getGraph();

console.log('📊 Available methods:');
console.log('- graph.draw_mermaid()');
console.log('- graph.draw_state_flow()');
console.log('- graph.save_diagrams()');
console.log('- graph.display()\n');

// Display the graph in console (like Python's display())
console.log('🖥️  Displaying graph in console:');
ecommerceAgent.displayGraph();

// Save diagrams to files
console.log('\n💾 Saving diagrams to files...');
ecommerceAgent.saveGraphDiagrams().then((result) => {
  console.log('\n✅ Visualization complete!');
  console.log('📁 Check the graph-visualizations folder for HTML files');
}).catch(console.error); 