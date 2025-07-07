# Podcast Summarizer
Ask the agent for the latest episode of any podcast and get a crisp one-page briefing with chapters, quotes, a sentiment meter, and optional follow-up reading links.

# Tools (3)
1	FeedFetcher	
Given a show name -> returns RSS feed & episode metadata, including audio URL
Given an input string from a message, parse out a podcast search term, then search for the podcast using
Apple iTunes search, for ex: https://itunes.apple.com/search?entity=podcast&term=Lex+Fridman

2	AudioGrabber	
Downloads the chosen MP3/MP4 and turns the audio -> text. Use OpenAI Whisper API

4	Summarizer/Analyst	
Produces: TL;DR, chapter list, key quotes, sentiment. Do this via an LLM call with a system prompt template,
and possible modulate response by user's initial query.