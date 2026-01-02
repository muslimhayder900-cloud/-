
import { Channel } from '../types';

export const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};
  let channelCounter = 1000;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const chNoMatch = line.match(/tvg-chno="([^"]*)"/);
      
      const nameParts = line.split(',');
      const name = nameParts[nameParts.length - 1].trim() || 'Unknown Channel';
      const group = groupMatch ? groupMatch[1] : 'Uncategorized';
      
      // Heuristic for country detection based on group name
      let country = 'International';
      const lowerGroup = group.toLowerCase();
      if (lowerGroup.includes('arabic') || lowerGroup.includes('middle east') || lowerGroup.includes('ar:') || name.toLowerCase().includes('ar:')) {
        country = 'Arabic';
      } else if (lowerGroup.includes('france') || lowerGroup.includes('fr:')) {
        country = 'France';
      } else if (lowerGroup.includes('germany') || lowerGroup.includes('de:')) {
        country = 'Germany';
      } else if (lowerGroup.includes('usa') || lowerGroup.includes('us:')) {
        country = 'USA';
      }

      currentChannel = {
        name,
        number: chNoMatch ? parseInt(chNoMatch[1]) : ++channelCounter,
        logo: logoMatch ? logoMatch[1] : undefined,
        group,
        country,
        tvgId: tvgIdMatch ? tvgIdMatch[1] : undefined,
      };
    } else if (line.startsWith('http')) {
      if (currentChannel.name) {
        currentChannel.url = line;
        currentChannel.id = `${currentChannel.name}-${line}`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        channels.push(currentChannel as Channel);
      }
      currentChannel = {};
    }
  }

  return channels;
};

export const fetchAndParsePlaylist = async (url: string): Promise<Channel[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch playlist');
    const content = await response.text();
    return parseM3U(content);
  } catch (error) {
    console.error('Playlist Fetch Error:', error);
    throw error;
  }
};
