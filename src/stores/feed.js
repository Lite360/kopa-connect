import { defineStore } from 'pinia'
import { API } from './auth'

export const useFeedStore = defineStore('feed', {
  state: () => ({
    posts: [],
    loading: false,
    page: 1,
    hasMore: true,
    currentTab: 'for_you'
  }),
  
  actions: {
    async fetchPosts(tab = this.currentTab, refresh = false) {
      if (refresh) {
        this.page = 1
        this.posts = []
        this.hasMore = true
      }
      
      if (!this.hasMore || this.loading) return
      
      this.currentTab = tab
      this.loading = true
      
      try {
        const { data } = await API.get(`/feed?tab=${tab}&page=${this.page}&limit=10`)
        
        if (this.page === 1) {
          this.posts = data.data
        } else {
          this.posts = [...this.posts, ...data.data]
        }
        
        this.hasMore = data.pagination.hasMore
        if (this.hasMore) this.page++
      } catch (err) {
        console.error('Fetch feed failed:', err)
      } finally {
        this.loading = false
      }
    },
    
    async createPost(payload) {
      const { data } = await API.post('/feed/posts', payload)
      // Prepend to feed if it matches current view
      this.posts.unshift(data.post)
      return data.post
    },
    
    async toggleLike(postId) {
      const post = this.posts.find(p => p.id === postId)
      if (!post) return
      
      const isLiked = post.is_liked
      post.is_liked = !isLiked
      post.likes_count += isLiked ? -1 : 1
      
      try {
        if (isLiked) {
          await API.delete(`/feed/posts/${postId}/like`)
        } else {
          await API.post(`/feed/posts/${postId}/like`)
        }
      } catch (err) {
        // Revert on error
        post.is_liked = isLiked
        post.likes_count += isLiked ? 1 : -1
      }
    }
  }
})
