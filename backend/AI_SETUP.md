# AI Chatbot Setup Guide

## Prerequisites

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your environment variables

## Environment Variables

Add this to your `.env` file in the backend directory:

```
GEMINI_API_KEY=your-gemini-api-key-here
```

## Features

The AI chatbot provides:

1. **Product Search**: Ask about specific products
2. **Product Comparison**: Compare multiple products
3. **General Assistance**: Help with orders, shipping, returns
4. **Smart Recommendations**: AI-powered product suggestions

## Example Queries

- "Show me laptops under $1000"
- "Compare iPhone and Samsung phones"
- "What's the best laptop for gaming?"
- "I need help with my order"
- "What's your return policy?"

## How it Works

1. **Product Queries**: The AI searches your product database and provides relevant results
2. **Comparisons**: When multiple products are found, the AI generates detailed comparisons
3. **Context-Aware**: The AI understands your e-commerce context and provides relevant responses
4. **Integration**: Products can be added to cart directly from chat responses

## Usage

The chatbot appears as a floating button in the bottom-right corner of your application. Users can:

1. Click the chat button to open the chat window
2. Type their questions or requests
3. View AI responses with product recommendations
4. Add products to cart directly from the chat
5. Click on products to view detailed pages

## Technical Details

- **Backend**: Node.js + GraphQL + Gemini AI
- **Frontend**: React + Apollo Client
- **Database**: MongoDB for product search
- **AI Model**: Google Gemini Pro for natural language processing 