'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Clock, ExternalLink } from 'lucide-react'
import type { GameVideo, Team } from '@/types/game'
import { formatDuration, getEmbedUrl, getWatchUrl, getThumbnailUrl } from '@/lib/youtube'

interface VideoCardProps {
  videos: GameVideo[]
  homeTeam: Team
  awayTeam: Team
}

type VideoType = 'highlights' | 'full_game'

export function VideoCard({ videos, homeTeam, awayTeam }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeType, setActiveType] = useState<VideoType>('highlights')

  // Get videos by type
  const highlightVideo = videos.find(v => v.video_type === 'highlights')
  const fullGameVideo = videos.find(v => v.video_type === 'full_game')

  // If no videos at all, don't render
  if (!highlightVideo && !fullGameVideo) {
    return null
  }

  // Get current video based on active tab (fallback to whatever is available)
  const currentVideo = activeType === 'full_game' && fullGameVideo
    ? fullGameVideo
    : highlightVideo || fullGameVideo

  if (!currentVideo) return null

  const thumbnailUrl = currentVideo.thumbnail_url ||
    getThumbnailUrl(currentVideo.youtube_id, 'high')

  const hasMultipleTypes = highlightVideo && fullGameVideo

  const handleTabChange = (type: VideoType) => {
    setActiveType(type)
    setIsPlaying(false) // Reset playing state when switching tabs
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Game Videos</span>
          <a
            href={getWatchUrl(currentVideo.youtube_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-normal text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Watch on YouTube
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardTitle>

        {/* Video type tabs */}
        {hasMultipleTypes && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleTabChange('highlights')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeType === 'highlights'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Highlights
            </button>
            <button
              onClick={() => handleTabChange('full_game')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeType === 'full_game'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Full Game
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          {isPlaying ? (
            <iframe
              src={`${getEmbedUrl(currentVideo.youtube_id)}?autoplay=1&rel=0&modestbranding=1`}
              title={currentVideo.title}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 w-full h-full group cursor-pointer"
              aria-label="Play video"
            >
              {/* Thumbnail */}
              <img
                src={thumbnailUrl}
                alt={`${awayTeam.team_name} vs ${homeTeam.team_name} ${activeType === 'full_game' ? 'full game' : 'highlights'}`}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="h-8 w-8 text-white fill-white ml-1" />
                </div>
              </div>

              {/* Duration badge */}
              {currentVideo.duration && (
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(currentVideo.duration)}
                </div>
              )}

              {/* Video type badge (when only one type available) */}
              {!hasMultipleTypes && (
                <div className="absolute top-3 left-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {currentVideo.video_type === 'full_game' ? 'Full Game' : 'Highlights'}
                </div>
              )}
            </button>
          )}
        </div>

        {/* Video title */}
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {currentVideo.title}
        </p>

        {/* Channel info */}
        {currentVideo.channel_title && (
          <p className="text-xs text-muted-foreground mt-1">
            {currentVideo.channel_title}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
