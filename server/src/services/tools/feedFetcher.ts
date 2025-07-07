import BaseTool from './base';
import fetch from 'node-fetch';
import FeedParser from 'feedparser';
import { Readable } from 'stream';

interface ITunesPodcastResult {
  wrapperType: string;
  kind: string;
  collectionId: number;
  trackId: number;
  artistName: string;
  collectionName: string;
  trackName: string;
  collectionViewUrl: string;
  feedUrl: string;
  trackViewUrl: string;
  artworkUrl30: string;
  artworkUrl60: string;
  artworkUrl100: string;
  collectionPrice: number;
  trackPrice: number;
  collectionHdPrice: number;
  releaseDate: string;
  collectionExplicitness: string;
  trackExplicitness: string;
  trackCount: number;
  country: string;
  currency: string;
  primaryGenreName: string;
  contentAdvisoryRating: string;
  artworkUrl600: string;
  genreIds: string[];
  genres: string[];
}

interface ITunesSearchResult {
  resultCount: number;
  results: ITunesPodcastResult[];
}

interface PodcastEpisode {
  title: string;
  description: string;
  pubDate: string;
  audioUrl: string;
}

interface PodcastMetadata {
  title: string;
  description: string;
  latestEpisode: PodcastEpisode | null;
}

export default class FeedFetcher extends BaseTool {
  constructor(config: any) {
    super(config);
    this.name = 'FeedfFetcher';
    this.description = 'Given a show name, returns RSS feed & episode metadata.';
  }

  getParameterSchema(): Record<string, any> {
    return {
      type: 'object',
      properties: {
        showName: {
          type: 'string',
          description: 'The name or search term of the podcast show to search for.',
        },
      },
      required: ['showName'],
    };
  }

  async execute(params: Record<string, any> = {}): Promise<PodcastMetadata | null> {
    const { showName } = params;
    if (!showName) {
      throw new Error('showName parameter is required.');
    }

    try {
      // Step 1: Search for the podcast using Apple iTunes Search API
      const searchTerm = encodeURIComponent(showName)
      const searchUrl = `https://itunes.apple.com/search?entity=podcast&term=${searchTerm}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json() as ITunesSearchResult;

      if (!searchResponse.ok) {
        throw new Error(`iTunes search failed with status: ${searchResponse.status}`);
      }

      if (!searchData.results || searchData.results.length === 0) {
        console.log(`No podcast found for "${showName}"`);
        return null;
      }

      const podcast = searchData.results[0];
      const feedUrl = podcast.feedUrl;

      if (!feedUrl) {
        console.log(`No RSS feed URL found for "${showName}"`);
        return null;
      }

      // Step 2: Fetch and parse the RSS feed
      const feedResponse = await fetch(feedUrl);
      if (!feedResponse.ok) {
        throw new Error(`Failed to fetch RSS feed from ${feedUrl} with status: ${feedResponse.status}`);
      }

      const feedparser = new FeedParser({});
      const episodes: PodcastEpisode[] = [];
      let podcastTitle: string = '';
      let podcastDescription: string = '';

      const stream = new Readable();
      stream.push(await feedResponse.text());
      stream.push(null);

      stream.pipe(feedparser);

      return new Promise((resolve, reject) => {
        feedparser.on('error', (error: Error) => {
          reject(new Error(`Error parsing RSS feed: ${error.message}`));
        });

        feedparser.on('readable', function (this: FeedParser) {
          let item;
          while ((item = this.read())) {
            if (!podcastTitle && item.meta.title) {
              podcastTitle = item.meta.title;
            }
            if (!podcastDescription && item.meta.description) {
              podcastDescription = item.meta.description;
            }

            episodes.push({
              title: item.title || 'No Title',
              description: item.description || 'No Description',
              pubDate: item.pubdate ? item.pubdate.toISOString() : 'No Date',
              audioUrl: item.enclosures && item.enclosures.length > 0 ? item.enclosures[0].url : 'No Audio URL',
            });
          }
        });

        feedparser.on('end', () => {
          // Sort episodes by pubDate in descending order to get the latest
          episodes.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
          const latestEpisode = episodes.length > 0 ? episodes[0] : null;

          resolve({
            title: podcastTitle,
            description: podcastDescription,
            latestEpisode: latestEpisode,
          });
        });
      });

    } catch (error: any) {
      console.error(`Error in FeedFetcher: ${error.message}`);
      throw new Error(`Failed to fetch or parse podcast feed: ${error.message}`);
    }
  }
}
