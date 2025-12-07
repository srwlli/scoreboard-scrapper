import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format player name as "F. Lastname"
 * Example: "Patrick Mahomes" -> "P. Mahomes"
 */
export function formatPlayerName(fullName: string | null | undefined): string {
  if (!fullName) return ''
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return parts[0]
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ')
  return `${firstName[0]}. ${lastName}`
}

/**
 * Abbreviate player names in play descriptions
 * Looks for patterns like "Firstname Lastname" and converts to "F. Lastname"
 * Example: "Patrick Mahomes passes for 40 yards" -> "P. Mahomes passes for 40 yards"
 */
export function abbreviateNamesInDescription(description: string | null | undefined): string {
  if (!description) return ''

  // Common action words that follow player names to help identify name boundaries
  const actionWords = ['pass', 'passes', 'rush', 'rushes', 'run', 'runs', 'catch', 'catches',
    'complete', 'completes', 'incomplete', 'intercept', 'intercepted', 'sack', 'sacked',
    'fumble', 'fumbles', 'kick', 'kicks', 'punt', 'punts', 'return', 'returns',
    'tackle', 'tackled', 'to', 'for', 'from', 'at', 'up', 'down', 'left', 'right',
    'middle', 'deep', 'short', 'yard', 'yards', 'touchdown', 'safety', 'field', 'extra',
    'two-point', 'conversion', 'recovered', 'forced', 'and', 'the']

  // Pattern to match "Capitalized Capitalized" that looks like a name (2-3 parts)
  // Excludes common football terms
  const excludePatterns = ['First Down', 'Field Goal', 'No Good', 'Two Point', 'Extra Point',
    'End Zone', 'Red Zone', 'Touchdown Pass', 'Pass Incomplete', 'Pass Complete']

  let result = description

  // Find patterns that look like full names (Capitalized Capitalized)
  // This regex matches: "Word Word" or "Word Word-Word" or "Word Word Jr" etc
  const namePattern = /\b([A-Z][a-z]+(?:\s+(?:Jr|Sr|III|II|IV))?)(\s+)([A-Z][a-z]+(?:-[A-Z][a-z]+)?(?:\s+(?:Jr|Sr|III|II|IV))?)\b/g

  result = result.replace(namePattern, (match, firstName, space, lastName) => {
    // Check if this matches an excluded pattern
    const fullMatch = `${firstName}${space}${lastName}`
    if (excludePatterns.some(p => fullMatch.includes(p))) {
      return match
    }

    // Check if lastName is an action word (not a real last name)
    if (actionWords.includes(lastName.toLowerCase())) {
      return match
    }

    return `${firstName[0]}. ${lastName}`
  })

  return result
}
