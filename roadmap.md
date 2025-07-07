# Podcast Summarizer
Ask the agent questions about the latest episode of any given podcast.

# Tools (3)
1	FeedFetcher	
Given a show name -> returns RSS feed & episode metadata, including audio URL
Given an input string from a message, parse out a podcast search term, then search for the podcast using
Apple iTunes search, for ex: https://itunes.apple.com/search?entity=podcast&term=Lex+Fridman

2	AudioGrabber	
Downloads the chosen MP3/MP4 and turns the audio -> text. Use OpenAI Whisper API

3	Summarizer/Analyst	
Answer's the user's original query.


# Example: 
Give me a crisp one-page briefing with chapters, quotes, sentiment on the latest FT News Briefing.
