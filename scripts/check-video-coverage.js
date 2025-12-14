/**
 * Check video coverage across seasons
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCoverage() {
  // Get all final games
  const { data: games, error: gamesErr } = await supabase
    .from('games')
    .select('game_id, season, week')
    .eq('status', 'final');

  if (gamesErr) {
    console.error('Error fetching games:', gamesErr);
    return;
  }

  // Get existing videos (highlights)
  const { data: highlights } = await supabase
    .from('game_videos')
    .select('game_id')
    .eq('video_type', 'highlights');

  // Get existing videos (full_game)
  const { data: fullGames } = await supabase
    .from('game_videos')
    .select('game_id')
    .eq('video_type', 'full_game');

  const hasHighlight = new Set((highlights || []).map(v => v.game_id));
  const hasFullGame = new Set((fullGames || []).map(v => v.game_id));

  // Count by season
  const stats = {};
  games.forEach(g => {
    if (!stats[g.season]) {
      stats[g.season] = { total: 0, highlights: 0, fullGames: 0, needHighlights: 0, needFullGames: 0 };
    }
    stats[g.season].total++;
    if (hasHighlight.has(g.game_id)) stats[g.season].highlights++;
    else stats[g.season].needHighlights++;
    if (hasFullGame.has(g.game_id)) stats[g.season].fullGames++;
    else stats[g.season].needFullGames++;
  });

  console.log('='.repeat(60));
  console.log('VIDEO COVERAGE REPORT');
  console.log('='.repeat(60));

  let totalNeedHighlights = 0;
  let totalNeedFullGames = 0;

  Object.keys(stats).sort().forEach(season => {
    const s = stats[season];
    console.log(`\n${season} Season:`);
    console.log(`  Total games: ${s.total}`);
    console.log(`  Highlights: ${s.highlights}/${s.total} (${s.needHighlights} need scraping)`);
    console.log(`  Full Games: ${s.fullGames}/${s.total} (${s.needFullGames} need scraping)`);
    totalNeedHighlights += s.needHighlights;
    totalNeedFullGames += s.needFullGames;
  });

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total games needing highlights: ${totalNeedHighlights}`);
  console.log(`Total games needing full games: ${totalNeedFullGames}`);
  console.log(`\nAt 85 games/day:`);
  console.log(`  Highlights: ${Math.ceil(totalNeedHighlights / 85)} days`);
  console.log(`  Full games: ${Math.ceil(totalNeedFullGames / 85)} days`);
}

checkCoverage().catch(console.error);
