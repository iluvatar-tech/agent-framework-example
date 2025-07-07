# Agent Framework Example

This project is a demonstration of an AI agent framework. It features a React-based frontend and a Node.js backend, showcasing how AI agents can be equipped with various tools to perform complex tasks. The primary example provided is a `PodcastAgent` capable of fetching podcast information, transcribing episodes, and summarizing content.

## Architecture

The project is divided into two main parts:

-   **Frontend**: A React application located in the `src/` directory. It provides a user-friendly chat interface for interacting with the AI agents.
-   **Backend**: A Node.js server located in the `server/` directory. It hosts the agent logic, including the different types of agents and their associated tools.

### Agents

The core of the backend is the agent system, which includes:

-   `GenericAgent`: A flexible, generic agent that can be configured with different tools and memory systems.
-   `PodcastAgent`: A specialized agent built on top of `GenericAgent`, designed specifically for podcast-related tasks.

### Tools

The agents are equipped with a set of tools to enhance their capabilities:

-   `FeedFetcher`: Searches for podcasts and retrieves their RSS feeds to find the latest episodes.
-   `AudioGrabber`: Downloads audio files from a given URL and transcribes them using OpenAI's Whisper API.
-   `SummarizerAnalyst`: Takes transcribed text and generates a summary or answers questions based on the content.

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites

-   Node.js
-   npm
-   An OpenAI API key (for transcription and analysis)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/iluvatar-tech/agent-framework-example.git
    ```
2.  Install the dependencies for the frontend and backend:
    ```sh
    npm install
    cd server && npm install
    ```
3.  Create a `.env` file in the `server` directory and add your OpenAI API key:
    ```
    OPENAI_API_KEY=your_api_key_here
    ```

### Running the Application

1.  **Start the frontend & backend server:**
    ```sh
    cd server && npm start
    ```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser. Server runs on port 3002.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Starter

This repo was built using starter code from Create React App: [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

