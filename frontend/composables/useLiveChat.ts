/**
 * Composable for live chat support
 * Real-time chat with sellers and support team
 */

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  sender_type: 'user' | 'seller' | 'support'
  message: string
  attachments?: {
    type: 'image' | 'file'
    url: string
    name: string
  }[]
  read: boolean
  timestamp: number
}

export interface Conversation {
  id: string
  type: 'seller' | 'support'
  participant_id?: string
  participant_name: string
  participant_avatar?: string
  participant_online: boolean
  last_message?: ChatMessage
  unread_count: number
  created_at: number
  updated_at: number
  status: 'active' | 'closed' | 'archived'
}

const STORAGE_KEY = 'chat_conversations'

export const useLiveChat = () => {
  const config = useRuntimeConfig()
  const conversations = ref<Conversation[]>([])
  const activeConversation = ref<Conversation | null>(null)
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const typing = ref(false)
  const online = ref(true)

  // WebSocket connection (simulated for now)
  let ws: WebSocket | null = null

  /**
   * Initialize WebSocket connection
   */
  const connect = () => {
    if (!process.client) return

    try {
      // In production, use real WebSocket URL
      // ws = new WebSocket(`${config.public.wsBase}/chat`)

      // ws.onopen = () => {
      //   online.value = true
      //   console.log('[Chat] Connected')
      // }

      // ws.onmessage = (event) => {
      //   const data = JSON.parse(event.data)
      //   handleIncomingMessage(data)
      // }

      // ws.onclose = () => {
      //   online.value = false
      //   console.log('[Chat] Disconnected')
      //   // Reconnect after 3 seconds
      //   setTimeout(connect, 3000)
      // }

      // For now, simulate connection
      online.value = true
    } catch (error) {
      console.error('[Chat] Connection error:', error)
      online.value = false
    }
  }

  /**
   * Disconnect WebSocket
   */
  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
      online.value = false
    }
  }

  /**
   * Get all conversations
   */
  const fetchConversations = async (): Promise<Conversation[]> => {
    loading.value = true

    try {
      const response = await $fetch<{ conversations: Conversation[] }>(
        `${config.public.apiBase}/chat/conversations`
      )

      conversations.value = response.conversations || []
      return conversations.value
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Start conversation with seller
   */
  const startSellerChat = async (
    sellerId: string,
    sellerName: string,
    productId?: number
  ): Promise<Conversation | null> => {
    loading.value = true

    try {
      const response = await $fetch<{ conversation: Conversation }>(
        `${config.public.apiBase}/chat/conversations`,
        {
          method: 'POST',
          body: {
            type: 'seller',
            participant_id: sellerId,
            product_id: productId,
          },
        }
      )

      const conversation = response.conversation
      conversation.participant_name = sellerName

      // Add to conversations if new
      if (!conversations.value.find(c => c.id === conversation.id)) {
        conversations.value.unshift(conversation)
      }

      activeConversation.value = conversation
      await fetchMessages(conversation.id)

      return conversation
    } catch (error) {
      console.error('Failed to start seller chat:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Start conversation with support
   */
  const startSupportChat = async (): Promise<Conversation | null> => {
    loading.value = true

    try {
      const response = await $fetch<{ conversation: Conversation }>(
        `${config.public.apiBase}/chat/conversations`,
        {
          method: 'POST',
          body: {
            type: 'support',
          },
        }
      )

      const conversation = response.conversation
      conversation.participant_name = 'Support AgriTech'

      if (!conversations.value.find(c => c.id === conversation.id)) {
        conversations.value.unshift(conversation)
      }

      activeConversation.value = conversation
      await fetchMessages(conversation.id)

      return conversation
    } catch (error) {
      console.error('Failed to start support chat:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch messages for a conversation
   */
  const fetchMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    loading.value = true

    try {
      const response = await $fetch<{ messages: ChatMessage[] }>(
        `${config.public.apiBase}/chat/conversations/${conversationId}/messages`
      )

      messages.value = response.messages || []

      // Mark as read
      await markAsRead(conversationId)

      return messages.value
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Send a message
   */
  const sendMessage = async (
    conversationId: string,
    message: string,
    attachments?: File[]
  ): Promise<ChatMessage | null> => {
    try {
      const formData = new FormData()
      formData.append('conversation_id', conversationId)
      formData.append('message', message)

      if (attachments) {
        attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file)
        })
      }

      const response = await $fetch<{ message: ChatMessage }>(
        `${config.public.apiBase}/chat/messages`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const newMessage = response.message

      // Add to messages
      messages.value.push(newMessage)

      // Update conversation
      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) {
        conv.last_message = newMessage
        conv.updated_at = Date.now()
      }

      // Emit via WebSocket if connected
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'message',
          data: newMessage,
        }))
      }

      return newMessage
    } catch (error) {
      console.error('Failed to send message:', error)
      return null
    }
  }

  /**
   * Mark conversation as read
   */
  const markAsRead = async (conversationId: string): Promise<boolean> => {
    try {
      await $fetch(`${config.public.apiBase}/chat/conversations/${conversationId}/read`, {
        method: 'POST',
      })

      // Update unread count
      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) {
        conv.unread_count = 0
      }

      // Mark messages as read
      messages.value.forEach(m => {
        if (m.conversation_id === conversationId) {
          m.read = true
        }
      })

      return true
    } catch (error) {
      console.error('Failed to mark as read:', error)
      return false
    }
  }

  /**
   * Close conversation
   */
  const closeConversation = async (conversationId: string): Promise<boolean> => {
    try {
      await $fetch(`${config.public.apiBase}/chat/conversations/${conversationId}/close`, {
        method: 'POST',
      })

      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) {
        conv.status = 'closed'
      }

      return true
    } catch (error) {
      console.error('Failed to close conversation:', error)
      return false
    }
  }

  /**
   * Delete conversation
   */
  const deleteConversation = async (conversationId: string): Promise<boolean> => {
    try {
      await $fetch(`${config.public.apiBase}/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      })

      conversations.value = conversations.value.filter(c => c.id !== conversationId)

      if (activeConversation.value?.id === conversationId) {
        activeConversation.value = null
        messages.value = []
      }

      return true
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      return false
    }
  }

  /**
   * Set typing indicator
   */
  const setTyping = (conversationId: string, isTyping: boolean) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'typing',
        conversation_id: conversationId,
        typing: isTyping,
      }))
    }
  }

  /**
   * Handle incoming message
   */
  const handleIncomingMessage = (data: any) => {
    if (data.type === 'message') {
      const message: ChatMessage = data.data

      // Add to messages if same conversation
      if (activeConversation.value?.id === message.conversation_id) {
        messages.value.push(message)
        markAsRead(message.conversation_id)
      }

      // Update conversation
      const conv = conversations.value.find(c => c.id === message.conversation_id)
      if (conv) {
        conv.last_message = message
        conv.updated_at = Date.now()
        if (activeConversation.value?.id !== message.conversation_id) {
          conv.unread_count++
        }
      }
    } else if (data.type === 'typing') {
      typing.value = data.typing
    } else if (data.type === 'online') {
      const conv = conversations.value.find(c => c.participant_id === data.user_id)
      if (conv) {
        conv.participant_online = data.online
      }
    }
  }

  /**
   * Get total unread count
   */
  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((sum, conv) => sum + conv.unread_count, 0)
  })

  /**
   * Get active conversations
   */
  const activeConversations = computed(() => {
    return conversations.value.filter(c => c.status === 'active')
  })

  /**
   * Format message time
   */
  const formatMessageTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }

  /**
   * Quick replies templates
   */
  const quickReplies = [
    'Bonjour, je suis intéressé par ce produit.',
    'Est-ce disponible en stock ?',
    'Quel est le délai de livraison ?',
    'Merci pour votre aide !',
    'Puis-je avoir plus d\'informations ?',
  ]

  /**
   * Save to localStorage
   */
  const saveToStorage = () => {
    if (!process.client) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.value))
    } catch (error) {
      console.error('Failed to save conversations:', error)
    }
  }

  /**
   * Load from localStorage
   */
  const loadFromStorage = () => {
    if (!process.client) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        conversations.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  // Initialize on mount
  onMounted(() => {
    loadFromStorage()
    connect()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  // Watch conversations and save
  watch(
    conversations,
    () => {
      saveToStorage()
    },
    { deep: true }
  )

  return {
    conversations: readonly(conversations),
    activeConversation,
    messages: readonly(messages),
    loading: readonly(loading),
    typing: readonly(typing),
    online: readonly(online),
    totalUnreadCount,
    activeConversations,
    quickReplies,
    connect,
    disconnect,
    fetchConversations,
    startSellerChat,
    startSupportChat,
    fetchMessages,
    sendMessage,
    markAsRead,
    closeConversation,
    deleteConversation,
    setTyping,
    formatMessageTime,
  }
}
