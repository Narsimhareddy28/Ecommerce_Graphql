import { StateGraph, END, START } from "@langchain/langgraph";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config.js';
import { Product } from '../models/Products.js';
import { Category } from '../models/Category.js';
import GraphVisualizer from './graphVisualizer.js';

// Define the state structure that flows between nodes
class EcommerceState {
  constructor() {
    this.userMessage = '';
    this.intent = '';
    this.searchResults = [];
    this.categories = [];
    this.response = '';
    this.responseType = '';
    this.products = [];
    this.error = null;
  }
}

class EcommerceAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.graph = this.buildGraph();
    this.visualizer = new GraphVisualizer(this);
  }

  // NODE 1: Intent Classification
  async classifyIntent(state) {
    console.log('🧠 NODE: Intent Classification');
    console.log('User message:', state.userMessage);

    try {
      const prompt = `
        Classify the user's intent from this message: "${state.userMessage}"
        
        Possible intents:
        - PRODUCT_SEARCH: Looking for specific products
        - PRODUCT_COMPARE: Wants to compare products
        - CATEGORY_BROWSE: Wants to see categories or browse
        - GENERAL_HELP: General questions about store, shipping, returns
        - GREETING: Just saying hello
        
        Respond with just the intent name (e.g., "PRODUCT_SEARCH").
      `;

      const result = await this.model.generateContent(prompt);
      const intent = result.response.text().trim();
      
      console.log('Classified intent:', intent);
      
      return {
        ...state,
        intent: intent
      };
    } catch (error) {
      console.error('Error in intent classification:', error);
      return {
        ...state,
        intent: 'GENERAL_HELP',
        error: error.message
      };
    }
  }

  // NODE 2: Product Search
  async searchProducts(state) {
    console.log('🔍 NODE: AI-Powered Product Search');
    console.log('User query:', state.userMessage);

    try {
      const userQuery = state.userMessage;

      // Step 1: Use AI to generate smart search keywords
      const keywordPrompt = `
        A customer is searching for: "${userQuery}"
        
        Generate smart search keywords that would help find relevant products in an e-commerce database.
        Consider:
        - Synonyms and related terms
        - Product categories (electronics, clothing, home, sports, beauty, etc.)
        - Brand names if mentioned
        - Product features and specifications
        - Different ways people might describe the same item
        
        For example:
        - "swim wear" → "swimwear, swimsuit, bikini, swimming, beach, pool, bathing suit"
        - "laptop" → "laptop, computer, notebook, portable computer, macbook, pc"
        - "phone" → "phone, smartphone, mobile, cell phone, iphone, android"
        
        Return ONLY a comma-separated list of keywords, no explanations.
      `;

      const keywordResult = await this.model.generateContent(keywordPrompt);
      const generatedKeywords = keywordResult.response.text().trim();
      console.log('AI generated keywords:', generatedKeywords);

      // Step 2: Create comprehensive search terms
      const aiKeywords = generatedKeywords.split(',').map(k => k.trim().toLowerCase());
      const originalTerms = userQuery.toLowerCase().split(' ');
      const allSearchTerms = [...new Set([...aiKeywords, ...originalTerms])]; // Remove duplicates

      console.log('All search terms:', allSearchTerms);

      // Step 3: Multi-field search with AI keywords
      const searchConditions = [];
      
      allSearchTerms.forEach(term => {
        if (term.length > 2) { // Only search for terms longer than 2 characters
          searchConditions.push({
            $or: [
              { name: { $regex: term, $options: 'i' } },
              { description: { $regex: term, $options: 'i' } }
            ]
          });
        }
      });

      // Also search in category names
      const categorySearchConditions = allSearchTerms.map(term => ({
        'category.name': { $regex: term, $options: 'i' }
      }));

      // Step 4: Execute search
      let products = [];
      
      if (searchConditions.length > 0) {
        // Search in products
        products = await Product.find({
          $or: searchConditions
        }).populate('category').limit(20);

        // Also search by category
        const categoryProducts = await Product.find().populate({
          path: 'category',
          match: { $or: categorySearchConditions }
        }).limit(20);

        // Combine results and remove duplicates
        const allProducts = [...products, ...categoryProducts.filter(p => p.category !== null)];
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p._id.toString() === product._id.toString())
        );

        products = uniqueProducts;
      }

      console.log('Found products before AI ranking:', products.length);

      // Step 5: Use AI to rank and filter results
      if (products.length > 0) {
        const productData = products.map(p => ({
          id: p._id.toString(),
          name: p.name,
          description: p.description.substring(0, 100) + '...', // Truncate for AI processing
          category: p.category?.name || 'Uncategorized',
          price: p.price
        }));

                 const rankingPrompt = `
           Customer query: "${userQuery}"
           
           Products found:
           ${JSON.stringify(productData, null, 2)}
           
           Rank these products by relevance to the customer's query.
           
           STRICT RANKING RULES:
           1. EXACT or VERY CLOSE matches should be ranked FIRST
           2. Products from the SAME CATEGORY as the query should be ranked higher
           3. Products with SIMILAR PURPOSE/USE should be ranked higher
           4. Products from COMPLETELY DIFFERENT categories should be ranked LAST
           
           For example:
           - If query is "swim wear" → "SWIM SUIT" should rank #1, clothing items #2-3, electronics LAST
           - If query is "laptop" → "MacBook Air" should rank #1, other electronics #2-3, clothing LAST
           
           Return ONLY the product IDs in order of relevance (most relevant first).
           Format: id1,id2,id3,id4,id5
           Return maximum 6 product IDs (focus on most relevant).
         `;

                 try {
           const rankingResult = await this.model.generateContent(rankingPrompt);
           const rankedIds = rankingResult.response.text().trim().split(',').map(id => id.trim());
           
           console.log('AI ranked product IDs:', rankedIds);

           // Step 6: Reorder products based on AI ranking
           const rankedProducts = [];
           const productMap = new Map(products.map(p => [p._id.toString(), p]));
           
           // Add products in AI-ranked order (only top ranked ones)
           rankedIds.forEach(id => {
             if (productMap.has(id)) {
               rankedProducts.push(productMap.get(id));
               productMap.delete(id);
             }
           });
           
           // Step 7: Filter out completely irrelevant products using AI
           if (rankedProducts.length > 3) {
             const filterPrompt = `
               Customer query: "${userQuery}"
               
               Top ranked products:
               ${rankedProducts.slice(0, 6).map(p => `${p.name} (${p.category?.name}) - ${p.description.substring(0, 50)}...`).join('\n')}
               
               Should I show ALL these products to the customer, or are some completely irrelevant?
               
               Rules:
               - If query is about clothing/fashion → ONLY show clothing items
               - If query is about electronics → ONLY show electronics
               - If query is about specific item → ONLY show that category
               
               Return "SHOW_ALL" if all products are relevant, or "FILTER" if some are irrelevant.
             `;
             
             try {
               const filterResult = await this.model.generateContent(filterPrompt);
               const filterDecision = filterResult.response.text().trim();
               
               if (filterDecision.includes('FILTER')) {
                 console.log('AI decided to filter out irrelevant products');
                 // Only show products from the most relevant category
                 const topProduct = rankedProducts[0];
                 const topCategory = topProduct.category?.name;
                 
                 if (topCategory) {
                   const filteredProducts = rankedProducts.filter(p => 
                     p.category?.name === topCategory
                   );
                   console.log(`Filtered to ${filteredProducts.length} products in ${topCategory} category`);
                   
                   return {
                     ...state,
                     searchResults: filteredProducts.slice(0, 4),
                     products: filteredProducts.slice(0, 4)
                   };
                 }
               }
             } catch (filterError) {
               console.error('Error in AI filtering:', filterError);
             }
           }

           console.log('Final ranked products:', rankedProducts.length);

           return {
             ...state,
             searchResults: rankedProducts.slice(0, 6), // Top 6 results
             products: rankedProducts.slice(0, 6)
           };
         } catch (rankingError) {
           console.error('Error in AI ranking, using original order:', rankingError);
           return {
             ...state,
             searchResults: products.slice(0, 6),
             products: products.slice(0, 6)
           };
         }
      }

      // Step 7: No products found - suggest alternatives
      console.log('No products found, getting suggestions');
      const allProducts = await Product.find().limit(8).populate('category');
      
      return {
        ...state,
        searchResults: [],
        products: allProducts, // Show some products as suggestions
        noResultsFound: true
      };

    } catch (error) {
      console.error('Error in AI-powered product search:', error);
      
      // Fallback to simple search
      try {
        const simpleQuery = {
          $or: [
            { name: { $regex: state.userMessage, $options: 'i' } },
            { description: { $regex: state.userMessage, $options: 'i' } }
          ]
        };
        
        const fallbackProducts = await Product.find(simpleQuery).populate('category').limit(8);
        
        return {
          ...state,
          searchResults: fallbackProducts,
          products: fallbackProducts,
          error: error.message
        };
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        return {
          ...state,
          searchResults: [],
          products: [],
          error: fallbackError.message
        };
      }
    }
  }

  // NODE 3: Category Browse
  async browseCategories(state) {
    console.log('📂 NODE: Category Browse');

    try {
      const categories = await Category.find();
      
      // Get sample products from each category
      const categoriesWithProducts = await Promise.all(
        categories.map(async (category) => {
          const products = await Product.find({ category: category._id })
            .populate('category')
            .limit(3);
          return { category, products };
        })
      );

      console.log('Found categories:', categories.length);

      return {
        ...state,
        categories: categoriesWithProducts,
        products: categoriesWithProducts.flatMap(c => c.products)
      };
    } catch (error) {
      console.error('Error in category browse:', error);
      return {
        ...state,
        categories: [],
        products: [],
        error: error.message
      };
    }
  }

  // NODE 4: Product Comparison
  async compareProducts(state) {
    console.log('⚖️ NODE: Product Comparison');

    try {
      const products = state.searchResults.slice(0, 3); // Compare max 3 products
      
      if (products.length < 2) {
        return {
          ...state,
          response: "I need at least 2 products to compare. Let me search for more options.",
          responseType: 'insufficient_products'
        };
      }

      const productData = products.map(p => ({
        name: p.name,
        price: p.price,
        description: p.description,
        category: p.category?.name || 'Uncategorized'
      }));

      const prompt = `
        Compare these products in detail:
        ${JSON.stringify(productData, null, 2)}
        
        Provide:
        1. Overview of each product
        2. Key differences
        3. Price comparison
        4. Pros and cons
        5. Recommendations for different use cases
        
        Make it helpful for a customer deciding what to buy.
      `;

      const result = await this.model.generateContent(prompt);
      const comparison = result.response.text();

      console.log('Generated comparison');

      return {
        ...state,
        response: comparison,
        responseType: 'comparison',
        products: products
      };
    } catch (error) {
      console.error('Error in product comparison:', error);
      return {
        ...state,
        response: "Sorry, I couldn't generate a comparison right now.",
        responseType: 'error',
        error: error.message
      };
    }
  }

  // NODE 5: Generate Product Response
  async generateProductResponse(state) {
    console.log('📝 NODE: Generate Product Response');

    try {
      const products = state.searchResults || state.products;
      
      if (products.length === 0 || state.noResultsFound) {
        // No products found - suggest alternatives with AI
        const allProducts = await Product.find().limit(6).populate('category');
        
        if (allProducts.length > 0) {
          const suggestionPrompt = `
            Customer searched for: "${state.userMessage}"
            
            We couldn't find exact matches. Here are some products we have:
            ${allProducts.map(p => `${p.name} (${p.category?.name || 'Uncategorized'}) - $${p.price}`).join('\n')}
            
            Write a helpful response that:
            1. Apologizes for not finding exact matches
            2. Suggests similar or related products from our inventory
            3. Encourages them to try different search terms
            4. Stays positive and helpful
            
            Be friendly like a helpful store assistant.
          `;
          
          const suggestionResult = await this.model.generateContent(suggestionPrompt);
          const suggestionResponse = suggestionResult.response.text();
          
          return {
            ...state,
            response: suggestionResponse,
            responseType: 'no_products',
            products: allProducts
          };
        } else {
          return {
            ...state,
            response: `I couldn't find products matching "${state.userMessage}". Our inventory is currently being updated. Please try again later!`,
            responseType: 'no_products',
            products: []
          };
        }
      }

      const productData = products.slice(0, 6).map(p => ({
        name: p.name,
        price: p.price,
        description: p.description.substring(0, 150) + (p.description.length > 150 ? '...' : ''),
        category: p.category?.name || 'Uncategorized'
      }));

      const prompt = `
        A customer asked: "${state.userMessage}"
        
        Here are the relevant products I found using AI search:
        ${JSON.stringify(productData, null, 2)}
        
        Write a helpful and engaging response that:
        1. Acknowledges their request enthusiastically
        2. Highlights the best matching products (mention specific names)
        3. Mentions key features, categories, and prices
        4. Explains why these products are good matches
        5. Asks if they need more specific help or want to compare products
        
        Be friendly, knowledgeable, and helpful like an expert sales assistant.
        Use emojis occasionally to make it more engaging.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      console.log('Generated enhanced product response');

      return {
        ...state,
        response: response,
        responseType: 'product_info',
        products: products.slice(0, 6)
      };
    } catch (error) {
      console.error('Error generating product response:', error);
      return {
        ...state,
        response: "Sorry, I encountered an error while finding products for you. Please try again!",
        responseType: 'error',
        error: error.message
      };
    }
  }

  // NODE 6: Generate Category Response
  async generateCategoryResponse(state) {
    console.log('🏷️ NODE: Generate Category Response');

    try {
      const categories = state.categories;
      
      if (categories.length === 0) {
        return {
          ...state,
          response: "We don't have any categories set up yet. Please check back later!",
          responseType: 'no_categories'
        };
      }

      const categoryList = categories.map(c => 
        `${c.category.name} (${c.products.length} products)`
      ).join(', ');

      const response = `Here are our categories: ${categoryList}. You can ask me about products in any of these categories, or say something like "show me electronics" to see specific products!`;

      return {
        ...state,
        response: response,
        responseType: 'categories',
        products: categories.flatMap(c => c.products)
      };
    } catch (error) {
      console.error('Error generating category response:', error);
      return {
        ...state,
        response: "Sorry, I couldn't load categories right now.",
        responseType: 'error',
        error: error.message
      };
    }
  }

  // NODE 7: Generate General Response
  async generateGeneralResponse(state) {
    console.log('💬 NODE: Generate General Response');

    try {
      const prompt = `
        A customer said: "${state.userMessage}"
        
        This is a general query for an e-commerce store. Provide a helpful response about:
        - Store policies (shipping, returns, etc.)
        - Account help
        - General shopping assistance
        - Friendly greeting responses
        
        Keep it concise and helpful.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      console.log('Generated general response');

      return {
        ...state,
        response: response,
        responseType: 'general',
        products: []
      };
    } catch (error) {
      console.error('Error generating general response:', error);
      return {
        ...state,
        response: "Hello! I'm here to help you find products and answer questions about our store. What can I help you with today?",
        responseType: 'general',
        products: []
      };
    }
  }

  // ROUTING FUNCTIONS - Determine which node to go to next
  routeAfterIntent(state) {
    console.log('🚦 ROUTING: After intent classification');
    console.log('Intent:', state.intent);

    switch (state.intent) {
      case 'PRODUCT_SEARCH':
        return 'searchProducts';
      case 'PRODUCT_COMPARE':
        return 'searchProducts'; // First search, then compare
      case 'CATEGORY_BROWSE':
        return 'browseCategories';
      case 'GREETING':
      case 'GENERAL_HELP':
      default:
        return 'generateGeneralResponse';
    }
  }

  routeAfterSearch(state) {
    console.log('🚦 ROUTING: After product search');
    console.log('Intent:', state.intent, 'Products found:', state.searchResults.length);

    if (state.intent === 'PRODUCT_COMPARE' && state.searchResults.length > 1) {
      return 'compareProducts';
    } else {
      return 'generateProductResponse';
    }
  }

  // BUILD THE GRAPH - Define nodes and edges
  buildGraph() {
    console.log('🏗️ Building LangGraph...');

    const workflow = new StateGraph({
      channels: {
        userMessage: null,
        intent: null,
        searchResults: null,
        categories: null,
        response: null,
        responseType: null,
        products: null,
        error: null
      }
    });

    // Add all nodes
    workflow.addNode('classifyIntent', this.classifyIntent.bind(this));
    workflow.addNode('searchProducts', this.searchProducts.bind(this));
    workflow.addNode('browseCategories', this.browseCategories.bind(this));
    workflow.addNode('compareProducts', this.compareProducts.bind(this));
    workflow.addNode('generateProductResponse', this.generateProductResponse.bind(this));
    workflow.addNode('generateCategoryResponse', this.generateCategoryResponse.bind(this));
    workflow.addNode('generateGeneralResponse', this.generateGeneralResponse.bind(this));

    // Define the flow with edges
    workflow.addEdge(START, 'classifyIntent');
    
    // Conditional routing after intent classification
    workflow.addConditionalEdges(
      'classifyIntent',
      this.routeAfterIntent.bind(this),
      {
        'searchProducts': 'searchProducts',
        'browseCategories': 'browseCategories',
        'generateGeneralResponse': 'generateGeneralResponse'
      }
    );

    // Conditional routing after product search
    workflow.addConditionalEdges(
      'searchProducts',
      this.routeAfterSearch.bind(this),
      {
        'compareProducts': 'compareProducts',
        'generateProductResponse': 'generateProductResponse'
      }
    );

    // End nodes
    workflow.addEdge('browseCategories', 'generateCategoryResponse');
    workflow.addEdge('compareProducts', END);
    workflow.addEdge('generateProductResponse', END);
    workflow.addEdge('generateCategoryResponse', END);
    workflow.addEdge('generateGeneralResponse', END);

    console.log('✅ LangGraph built successfully');
    return workflow.compile();
  }

  // GRAPH VISUALIZATION METHODS (like Python's get_graph())
  getGraph() {
    return this.visualizer.getGraph();
  }

  displayGraph() {
    return this.visualizer.displayGraph();
  }

  async saveGraphDiagrams() {
    return await this.visualizer.saveDiagrams();
  }

  // MAIN EXECUTION METHOD
  async processMessage(userMessage) {
    console.log('🚀 Starting LangGraph execution...');
    console.log('User message:', userMessage);

    const initialState = {
      userMessage: userMessage,
      intent: '',
      searchResults: [],
      categories: [],
      response: '',
      responseType: '',
      products: [],
      error: null
    };

    try {
      const result = await this.graph.invoke(initialState);
      
      console.log('✅ LangGraph execution completed');
      console.log('Final state:', {
        responseType: result.responseType,
        productsCount: result.products?.length || 0,
        hasError: !!result.error
      });

      return {
        message: result.response,
        type: result.responseType,
        products: result.products || [],
        error: result.error
      };
    } catch (error) {
      console.error('❌ Error in LangGraph execution:', error);
      return {
        message: "Sorry, I encountered an error while processing your request. Please try again.",
        type: 'error',
        products: [],
        error: error.message
      };
    }
  }
}

export default new EcommerceAgent(); 