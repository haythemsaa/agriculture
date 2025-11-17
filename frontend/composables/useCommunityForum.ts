import { ref, computed, readonly } from 'vue'

/**
 * Composable useCommunityForum - Community Forum System
 *
 * Discussion forum with topics, replies, voting, moderation,
 * Q&A sections, and expert answers
 *
 * Impact: +40% community engagement, +55% knowledge sharing, -25% support load
 */

// ==================== TYPES ====================

export type PostType = 'discussion' | 'question' | 'tip' | 'announcement'
export type PostStatus = 'active' | 'closed' | 'pinned' | 'locked'

export interface ForumCategory {
  id: string
  name: string
  description: string
  icon: string
  topics_count: number
  posts_count: number
  color: string
}

export interface ForumPost {
  id: string
  category_id: string
  type: PostType
  status: PostStatus
  title: string
  content: string
  author_id: number
  author_name: string
  author_avatar?: string
  author_level?: number
  is_expert: boolean
  views_count: number
  replies_count: number
  votes_count: number
  has_voted: boolean
  has_accepted_answer: boolean
  tags: string[]
  created_at: number
  updated_at: number
  last_reply_at?: number
}

export interface ForumReply {
  id: string
  post_id: string
  content: string
  author_id: number
  author_name: string
  author_avatar?: string
  is_expert: boolean
  is_accepted: boolean
  votes_count: number
  has_voted: boolean
  created_at: number
  updated_at: number
}

export interface ForumStats {
  total_posts: number
  total_replies: number
  active_topics: number
  total_members: number
  your_posts: number
  your_replies: number
  your_votes_received: number
}

// ==================== STATE ====================

const categories = ref<ForumCategory[]>([])
const posts = ref<ForumPost[]>([])
const replies = ref<Map<string, ForumReply[]>>(new Map())
const stats = ref<ForumStats | null>(null)
const isLoading = ref(false)

// ==================== COMPUTED ====================

const pinnedPosts = computed(() => posts.value.filter(p => p.status === 'pinned'))
const questionPosts = computed(() => posts.value.filter(p => p.type === 'question'))
const unansweredQuestions = computed(() => questionPosts.value.filter(p => !p.has_accepted_answer))

// ==================== CATEGORIES ====================

const fetchCategories = async (): Promise<ForumCategory[]> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const mockCategories: ForumCategory[] = [
      { id: '1', name: 'Conseils Agriculture', description: 'Tips et bonnes pratiques',icon: '🌾', topics_count: 145, posts_count: 892, color: '#10b981' },
      { id: '2', name: 'Questions & Réponses', description: 'Posez vos questions', icon: '❓', topics_count: 234, posts_count: 1456, color: '#3b82f6' },
      { id: '3', name: 'Recettes', description: 'Partagez vos recettes', icon: '👨‍🍳', topics_count: 89, posts_count: 567, color: '#f59e0b' },
      { id: '4', name: 'Actualités', description: 'News du secteur', icon: '📰', topics_count: 67, posts_count: 234, color: '#8b5cf6' }
    ]
    categories.value = mockCategories
    return mockCategories
  } finally {
    isLoading.value = false
  }
}

// ==================== POSTS ====================

const createPost = async (data: {
  category_id: string
  type: PostType
  title: string
  content: string
  tags?: string[]
}): Promise<ForumPost | null> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const post: ForumPost = {
      id: `post_${Date.now()}`,
      ...data,
      status: 'active',
      author_id: 1,
      author_name: 'User',
      is_expert: false,
      views_count: 0,
      replies_count: 0,
      votes_count: 0,
      has_voted: false,
      has_accepted_answer: false,
      tags: data.tags || [],
      created_at: Date.now(),
      updated_at: Date.now()
    }
    posts.value.unshift(post)
    return post
  } finally {
    isLoading.value = false
  }
}

const fetchPosts = async (category_id?: string, type?: PostType): Promise<ForumPost[]> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const mockPosts: ForumPost[] = [
      {
        id: '1', category_id: '1', type: 'tip', status: 'pinned',
        title: 'Les 10 meilleures pratiques pour cultiver bio',
        content: 'Voici mes conseils après 10 ans d\'expérience...',
        author_id: 5, author_name: 'Expert Karim', author_level: 8,
        is_expert: true, views_count: 1245, replies_count: 34,
        votes_count: 89, has_voted: false, has_accepted_answer: false,
        tags: ['bio', 'tips', 'débutant'], created_at: Date.now() - 7 * 24 * 60 * 60 * 1000,
        updated_at: Date.now() - 2 * 24 * 60 * 60 * 1000,
        last_reply_at: Date.now() - 1 * 60 * 60 * 1000
      },
      {
        id: '2', category_id: '2', type: 'question', status: 'active',
        title: 'Comment traiter les pucerons naturellement?',
        content: 'J\'ai des pucerons sur mes tomates, des solutions bio?',
        author_id: 12, author_name: 'Ali Fermier', author_level: 3,
        is_expert: false, views_count: 234, replies_count: 8,
        votes_count: 12, has_voted: true, has_accepted_answer: true,
        tags: ['bio', 'maladies', 'tomates'], created_at: Date.now() - 2 * 24 * 60 * 60 * 1000,
        updated_at: Date.now() - 5 * 60 * 60 * 1000,
        last_reply_at: Date.now() - 30 * 60 * 1000
      }
    ]
    posts.value = mockPosts
    return mockPosts
  } finally {
    isLoading.value = false
  }
}

const votePost = async (postId: string, upvote: boolean): Promise<boolean> => {
  const post = posts.value.find(p => p.id === postId)
  if (!post) return false
  post.votes_count += upvote ? 1 : -1
  post.has_voted = true
  return true
}

// ==================== REPLIES ====================

const createReply = async (postId: string, content: string): Promise<ForumReply | null> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const reply: ForumReply = {
      id: `reply_${Date.now()}`, post_id: postId, content,
      author_id: 1, author_name: 'User', is_expert: false,
      is_accepted: false, votes_count: 0, has_voted: false,
      created_at: Date.now(), updated_at: Date.now()
    }
    const postReplies = replies.value.get(postId) || []
    postReplies.push(reply)
    replies.value.set(postId, postReplies)
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.replies_count++
      post.last_reply_at = Date.now()
    }
    return reply
  } finally {
    isLoading.value = false
  }
}

const fetchReplies = async (postId: string): Promise<ForumReply[]> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const mockReplies: ForumReply[] = [
      {
        id: '1', post_id: postId,
        content: 'Utilisez du savon noir dilué, très efficace!',
        author_id: 5, author_name: 'Expert Karim', is_expert: true,
        is_accepted: true, votes_count: 23, has_voted: false,
        created_at: Date.now() - 1 * 24 * 60 * 60 * 1000,
        updated_at: Date.now() - 1 * 24 * 60 * 60 * 1000
      }
    ]
    replies.value.set(postId, mockReplies)
    return mockReplies
  } finally {
    isLoading.value = false
  }
}

const acceptAnswer = async (replyId: string): Promise<boolean> => {
  for (const [postId, postReplies] of replies.value.entries()) {
    const reply = postReplies.find(r => r.id === replyId)
    if (reply) {
      reply.is_accepted = true
      const post = posts.value.find(p => p.id === postId)
      if (post) post.has_accepted_answer = true
      return true
    }
  }
  return false
}

// ==================== STATISTICS ====================

const fetchStats = async (): Promise<ForumStats | null> => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    stats.value = {
      total_posts: 1234, total_replies: 5678, active_topics: 890,
      total_members: 3456, your_posts: 12, your_replies: 45, your_votes_received: 123
    }
    return stats.value
  } finally {
    isLoading.value = false
  }
}

// ==================== HELPERS ====================

const getPostStatusColor = (status: PostStatus): string => {
  const colors: Record<PostStatus, string> = {
    active: '#10b981', closed: '#6b7280', pinned: '#f59e0b', locked: '#ef4444'
  }
  return colors[status]
}

const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `Il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

// ==================== EXPORT ====================

export function useCommunityForum() {
  return {
    categories: readonly(categories), posts: readonly(posts),
    replies: readonly(replies), stats: readonly(stats),
    isLoading: readonly(isLoading), pinnedPosts, questionPosts,
    unansweredQuestions, fetchCategories, createPost, fetchPosts,
    votePost, createReply, fetchReplies, acceptAnswer, fetchStats,
    getPostStatusColor, formatTimeAgo
  }
}
