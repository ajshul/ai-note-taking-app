# AI-Enhanced Note-Taking App

## Description

The AI-Enhanced Note-Taking App is a React-based web application that allows users to take notes with inline Markdown rendering and LaTeX support. It features an AI-powered enhancement system that can expand and improve your notes, making them more detailed and suitable for exam review.

## Features

- Inline Markdown and LaTeX rendering
- AI-powered note enhancement
- Local storage for saving notes
- Export notes as Markdown files
- Responsive design with a collapsible sidebar

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- An OpenAI API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/ai-enhanced-note-taking-app.git
   cd ai-enhanced-note-taking-app
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   REACT_APP_OPENAI_API_KEY=your_api_key_here
   ```

## Usage

1. Start the development server:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`.

3. Start taking notes! You can use Markdown syntax and LaTeX for mathematical equations.

4. To enhance your notes with AI:
   - Press Cmd+Enter (Mac) or Ctrl+Enter (Windows)
   - The AI will process the content after the last horizontal line (---) or the entire note if there's no line.

5. Use the "Add Break" button to insert a horizontal line, separating different sections of your notes.

6. Click the "Export" button to download your note as a Markdown file.

## AI Enhancement

The AI enhancement feature uses OpenAI's GPT model to improve your notes. It focuses on:

- Expanding details and explanations
- Providing examples
- Clarifying confusing points
- Improving structure and organization
- Adding section headers
- Including summaries for key points

The AI considers the context of your entire note but only modifies the content after the last horizontal line (or the entire note if there's no line).
